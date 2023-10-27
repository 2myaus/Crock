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
    populateDPoints(){
        const dPointFrequency = 0.02;
        const dPointAvgRadius = 10;
        const dPointAvgDeviation = 5;

        this.dPoints = [];
        for(let i = 0; i < this.width * this.height * dPointFrequency; i++){
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            const rad = (Math.random() * 2 - 1) * dPointAvgDeviation + dPointAvgRadius;
            this.dPoints[i] = {x: x, y: y, radius: rad};
        }
    }
    populateDensities(){
        for(let i = 0; i < this.dPoints.length; i++){
            let dPoint = this.dPoints[i];
            for(let dx = -Math.floor(dPoint.radius); dx < Math.ceil(dPoint.radius); dx++){
                for(let dy = -Math.floor(dPoint.radius); dy < dPoint.radius; dy++){
                    const x = Math.floor(dPoint.x + dx);
                    const y = Math.floor(dPoint.y + dy);
                    let densityDif = (dPoint.radius - Math.sqrt(dx * dx + dy * dy)) / dPoint.radius;
                    if(densityDif < 0) densityDif = 0;
                    /*const currentBlock = this.getBlock(x, y);
                    const newBlock = new crock.Block(currentBlock.density + densityDif);
                    this.setBlock(x, y, newBlock);*/
                    this.increaseBlockDensity(x, y, densityDif);
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
        const startTime = Date.now();
        const numErosionsPerStep = 10;
        const waterDensity = 0.9;
        const verticalBias = 0;

        const waterPoints = Math.floor(waterDensity * this.width * this.height);
        let waterfiedGrid = [];
        let waterSurfacePoints = [];
        let waterSurfaceGrid = [];

        const addWaterSurfacePoint = (x, y) => {
            const density = this.getBlock(x, y).density;
            var idx = 0,
                high = waterSurfacePoints.length;
        
            while (idx < high) {
                var mid = (idx + high) >>> 1;
                if (waterSurfacePoints[mid][2] < density) idx = mid + 1;
                else high = mid;
            }
            waterSurfacePoints.splice(idx, 0, [x, y, density]);
            if(!waterSurfaceGrid[x]) waterSurfaceGrid[x] = [];
            waterSurfaceGrid[x][y] = true;
        }

        const removeWaterSurfacePoint = (x, y) => {
            if(!waterSurfaceGrid[x] || !waterSurfaceGrid[x][y]) return;
            waterSurfacePoints.splice(waterSurfacePoints.findIndex((point) => {return point[0] == x && point[1] == y}), 1);
            waterSurfaceGrid[x][y] = false;
        }
        const removeWaterSurfacePointAtIdx = (idx) => {
            const [x, y, _] = waterSurfacePoints[idx];
            waterSurfacePoints.splice(idx, 1);
            waterSurfaceGrid[x][y] = false;
        }
        const removeWaterSurfacePointsAtRange = (idx, num) => {
            for(let i = 0; i < num; i++){
                const [x, y, _] = waterSurfacePoints[idx + i];
                waterSurfaceGrid[x][y] = false;
            }
            waterSurfacePoints.splice(idx, num);
        }
        const getWaterSurfaceGrid = (x, y) => {
            return (waterSurfaceGrid[x] && waterSurfaceGrid[x][y])
        }

        /*
        for(let x = 0; x < this.width; x++){
            addWaterSurfacePoint(x, 0);
        }
        */
       addWaterSurfacePoint(Math.floor(this.width / 2), 0);

        for(let i = 0; i < waterPoints;){
            /*if(i % 1000 == 0){
                console.log("push "+i.toString()+" of "+waterPoints.toString()+" ("+(100*i/waterPoints)+"%)");
            }*/
            let startidx = waterSurfacePoints.length - numErosionsPerStep - 1;
            const numIters = waterSurfacePoints.length - startidx;
            if(startidx < 0){
                startidx = 0;
            }
            for(let pointsidx = startidx; pointsidx < waterSurfacePoints.length; pointsidx++){
                const [x, y, _] = waterSurfacePoints[pointsidx];

                const isWithinBounds = (x, y) => x >= 0 && x < this.width && y >= 0 && y < this.height;
                const isUnoccupied = (x, y) => !waterfiedGrid[x] || !waterfiedGrid[x][y];

                const pushDirections = [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ];

                for (const [dx, dy] of pushDirections) {
                    const newX = x + dx;
                    const newY = y + dy;

                    if (isWithinBounds(newX, newY) && isUnoccupied(newX, newY) && !getWaterSurfaceGrid(newX, newY)) {
                        addWaterSurfacePoint(newX, newY);
                    }
                }

                if (!waterfiedGrid[x]) waterfiedGrid[x] = [];
                waterfiedGrid[x][y] = true;
                this.setBlock(x, y, crock.emptyBlock);
            }
            removeWaterSurfacePointsAtRange(startidx, numIters);
            i += numIters
        }
        const endTime = Date.now();
        const dTime = endTime - startTime;
        console.log("Took "+dTime+" ms");
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
                    else if(numNeighbors > 4){
                        this.setBlock(x, y, {density: 1});
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
};
