let crock = {
};

crock.Block = class Block{
    constructor(density){
        this.density = density;
    }
};

crock.emptyBlock = new crock.Block(0);

crock.Cave = class Cave{
    constructor(width, height){
        this.grid = [];
        this.width = width;
        this.height = height;
    }
    getDPoints(){
        const dPointFrequency = 0.02;
        const dPointAvgRadius = 10;
        const dPointAvgDeviation = 5;

        let dPoints = [];
        for(let i = 0; i < this.width * this.height * dPointFrequency; i++){
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            const rad = (Math.random() * 2 - 1) * dPointAvgDeviation + dPointAvgRadius;
            dPoints[i] = {x: x, y: y, radius: rad};
        }
        return dPoints;
    }
    populateDensities(){
        const dPoints = this.getDPoints();
        for(let i = 0; i < dPoints.length; i++){
            let dPoint = dPoints[i];
            for(let dx = -Math.floor(dPoint.radius); dx < Math.ceil(dPoint.radius); dx++){
                for(let dy = -Math.floor(dPoint.radius); dy < dPoint.radius; dy++){
                    const x = Math.floor(dPoint.x + dx);
                    const y = Math.floor(dPoint.y + dy);
                    let densityDif = (dPoint.radius - Math.sqrt(dx * dx + dy * dy)) / dPoint.radius;
                    if(densityDif < 0) densityDif = 0;
                    this.increaseBlockDensity(x, y, densityDif);
                }
            }
        }
    }
    populateMinerality(mineralName){
        const dPoints = this.getDPoints();
        for(let i = 0; i < dPoints.length; i++){
            let dPoint = dPoints[i];
            for(let dx = -Math.floor(dPoint.radius); dx < Math.ceil(dPoint.radius); dx++){
                for(let dy = -Math.floor(dPoint.radius); dy < dPoint.radius; dy++){
                    const x = Math.floor(dPoint.x + dx);
                    const y = Math.floor(dPoint.y + dy);
                    let densityDif = (dPoint.radius - Math.sqrt(dx * dx + dy * dy)) / dPoint.radius;
                    if(densityDif < 0) densityDif = 0;
                    this.increaseBlockMinerality(x, y, mineralName, densityDif);
                }
            }
        }
    }
    erodeBlocksFast(){
        for(let x = 0; x < this.width; x++){
            for(let y = 0; y < this.height; y++){
                if(this.getBlock(x, y).density < 2){
                    this.setBlock(x, y, crock.emptyBlock);
                }
            }
        }
    }
    erodeBlocks(){
        const waterDensity = 0.4;

        const waterPoints = Math.floor(waterDensity * this.width * this.height);
        let waterfiedGrid = [];
        let waterSurfaceGrid = [];

        let waterSurfacePoints = []; //Binary tree

        const addWaterSurfacePoint = (x, y) => {
            const density = this.getBlock(x, y).density;
            let currentNode = waterSurfacePoints;
            //Node structure: [left, [x, y, density], right]
            while(true){
                if(!currentNode) currentNode = [];
                if(!currentNode[1]){
                    if(currentNode[1] != 0){ //If an end node was found
                        currentNode[1] = [x, y, density];
                        break;
                    }
                    if(!currentNode[2]) currentNode[2] = [];
                    currentNode = currentNode[2];
                    continue;
                }

                if(density < currentNode[1][2]){
                    if(!currentNode[0]) currentNode[0] = [];
                    currentNode = currentNode[0];
                    continue;
                }

                if(!currentNode[2]) currentNode[2] = [];
                currentNode = currentNode[2];
                continue;
            }
            if(!waterSurfaceGrid[x]) waterSurfaceGrid[x] = [];
            waterSurfaceGrid[x][y] = true;
        }

        const removeLeastDenseSurfacePoints = (count) => {
            let leftToRemove = count;
            const removeRemaining = (node) => {
                if(node[0][0]){
                    removeRemaining(node[0]);
                }
                if(leftToRemove > 0){
                    node[0] = node[0][2];
                    leftToRemove--;
                }
            }
            while(leftToRemove > 0){
                if(waterSurfacePoints[0]){
                    removeRemaining(waterSurfacePoints);
                    continue;
                }
                waterSurfacePoints = waterSurfacePoints[2];
                if(!waterSurfacePoints){
                    waterSurfacePoints = [];
                }
                leftToRemove--;
                continue;
            }
        }

        const forEachSurfacePoint = (surfacePoint, func) => {
            if(surfacePoint[0]){
                forEachSurfacePoint(surfacePoint[0]);
            }
            func(surfacePoint[1]);
            if(surfacePoint[2]){
                forEachSurfacePoint(surfacePoint[2]);
            }
        }

        const forLeastDenseSurfacePoints = (surfacePoint, timesToExec, func) => {
            let remainingTimes = timesToExec;
            if(surfacePoint[0]){
                remainingTimes = forLeastDenseSurfacePoints(surfacePoint[0], remainingTimes, func);
            }
            if(remainingTimes > 0){

                if(!surfacePoint[1]) return remainingTimes;

                func(surfacePoint[1]);
                remainingTimes--;
                if(remainingTimes > 0 && surfacePoint[2]){
                    remainingTimes = forLeastDenseSurfacePoints(surfacePoint[2], remainingTimes, func);
                }
            }
            return remainingTimes;
        }

        const getLeastDenseSurfacePoint = (surfacePoint) => {
            if(surfacePoint[0]){
                return getLeastDenseSurfacePoint(surfacePoint[0]);
            }
            return surfacePoint[1];
        }

        const removeLeastDenseSurfacePoint = (surfacePoint) => {
            if(!surfacePoint[0] && surfacePoint == waterSurfacePoints){
                waterSurfacePoints = waterSurfacePoints[2] || [];
                return;
            }
            if(surfacePoint[0][0]){
                removeLeastDenseSurfacePoint(surfacePoint[0]);
                return;
            }
            surfacePoint[0] = surfacePoint[0][2];
            return;
        }

        const getWaterSurfaceGrid = (x, y) => {
            return (waterSurfaceGrid[x] && waterSurfaceGrid[x][y])
        }

        const isWithinBounds = (x, y) => x >= 0 && x < this.width && y >= 0 && y < this.height;
        const isNotWaterfied = (x, y) => !waterfiedGrid[x] || !waterfiedGrid[x][y];

        addWaterSurfacePoint(Math.floor(this.width / 2), 0);

        let pointsRemoved = 0;

        while(pointsRemoved < waterPoints){

            const [x, y, _] = getLeastDenseSurfacePoint(waterSurfacePoints);
            removeLeastDenseSurfacePoint(waterSurfacePoints);

            const pushDirections = [
                [0, 1],
                [0, -1],
                [-1, 0],
                [1, 0]
            ];

            for (const [dx, dy] of pushDirections) {
                const newX = x + dx;
                const newY = y + dy;

                if (isWithinBounds(newX, newY) && isNotWaterfied(newX, newY) && !getWaterSurfaceGrid(newX, newY)) {
                    addWaterSurfacePoint(newX, newY);
                }
            }

            if(!isNotWaterfied(x, y)){
                console.log("Possible already removed block!");
            }

            if (!waterfiedGrid[x]) waterfiedGrid[x] = [];
            waterfiedGrid[x][y] = true;
            this.setBlock(x, y, crock.emptyBlock);

            pointsRemoved++;
        }
    }
    smoothBlocks(){
        const passes = 1;

        for(let i = 0; i < passes; i++){
            for(let x = 0; x < this.width; x++){
                for(let y = 0; y < this.height; y++){
                    let numNeighbors = 0;

                    if(this.getBlock(x - 1, y - 1).density > 0) numNeighbors++;
                    if(this.getBlock(x , y - 1).density > 0) numNeighbors++;
                    if(this.getBlock(x + 1, y - 1).density > 0) numNeighbors++;
                    if(this.getBlock(x - 1, y).density > 0) numNeighbors++;
                    if(this.getBlock(x + 1, y).density > 0) numNeighbors++;
                    if(this.getBlock(x - 1, y + 1).density > 0) numNeighbors++;
                    if(this.getBlock(x, y + 1).density > 0) numNeighbors++;
                    if(this.getBlock(x + 1, y + 1).density > 0) numNeighbors++;

                    if(numNeighbors < 4){
                        this.setBlock(x, y, crock.emptyBlock);
                    }
                }
            }
        }
    }
    getBlock(x, y){
        if(this.grid[x] && this.grid[x][y]){
            const block = this.grid[x][y];
            if(block) return block;
        }
        return crock.emptyBlock;
    }
    setBlock(x, y, block){
        if(!this.grid[x]) this.grid[x] = [];
        this.grid[x][y] = block;
    }
    increaseBlockDensity(x, y, amount){
        if(!this.grid[x]) this.grid[x] = [];
        if(this.grid[x][y]){
            this.grid[x][y].density += amount;
            return;
        }
        this.grid[x][y] = {density: amount};
    }
    increaseBlockMinerality(x, y, mineralName, amount){
        if(!this.grid[x]) this.grid[x] = [];
        if(this.grid[x][y]){
            if(!this.grid[x][y][mineralName]){
                this.grid[x][y][mineralName] = amount;
            }
            else{
                this.grid[x][y][mineralName] += amount;
            }
            return;
        }
        this.grid[x][y] = {density: 0};
        this.grid[x][y][mineralName] = amount;
    }
};
