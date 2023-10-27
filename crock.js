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
        this.dPoints.forEach(dPoint => {
            for(let dx = -Math.floor(dPoint.radius); dx < dPoint.radius; dx++){
                for(let dy = -Math.floor(dPoint.radius); dy < dPoint.radius; dy++){
                    const x = Math.floor(dPoint.x + dx);
                    const y = Math.floor(dPoint.y + dy);
                    let densityDif = (dPoint.radius - Math.sqrt(dx * dx + dy * dy)) / dPoint.radius;
                    if(densityDif < 0) densityDif = 0;
                    const currentBlock = this.getBlock(x, y);
                    const newBlock = new crock.Block(currentBlock.density + densityDif);
                    this.setBlock(x, y, newBlock);
                }
            }
        });
    }
    erodeBlocks(){
        const startTime = Date.now();
        const numErosionsPerStep = 10;
        const waterDensity = 0.3;
        const verticalBias = 0.001;

        const waterPoints = Math.floor(waterDensity * this.width * this.height / numErosionsPerStep);
        let waterfiedGrid = [];
        let waterSurfacePoints = [];

        for(let x = 0; x < this.width; x++){
            waterSurfacePoints.push([x, 0]);
        }

        for(let i = 0; i < waterPoints; i++){
            if(i % 1000 == 0){
                console.log("push "+i.toString());
            }
            let weakestPoints = [];
            waterSurfacePoints.forEach((wsp) => {
                if(weakestPoints.length < numErosionsPerStep){
                    weakestPoints.push(wsp);
                }
                else{
                    const weakestPoint = weakestPoints[weakestPoints.length - 1];
                    const weakestBlock = this.getBlock(weakestPoint[0], weakestPoint[1]);
                    if(!((wsp[0] == weakestPoint[0]) && (wsp[1] == weakestPoint[1])) &&
                    ((this.getBlock(wsp[0], wsp[1]).density - wsp[1] * verticalBias) < (weakestBlock.density - weakestPoint[1] * verticalBias))){
                        weakestPoints.push(wsp);
                        weakestPoints.shift();
                    }
                }
            });
            weakestPoints.forEach((wsp) => {
                const [x, y] = wsp;

                const isWithinBounds = (x, y) => x >= 0 && x < this.width && y >= 0 && y < this.height;
                const isUnoccupied = (x, y) => !waterfiedGrid[x] || !waterfiedGrid[x][y];

                const isWaterSurface = (point) => waterSurfacePoints.some(([px, py]) => px === point[0] && py === point[1]);

                const directions = [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ];

                for (const [dx, dy] of directions) {
                    const newX = x + dx;
                    const newY = y + dy;

                    if (isWithinBounds(newX, newY) && isUnoccupied(newX, newY) && !isWaterSurface([newX, newY])) {
                        waterSurfacePoints.push([newX, newY]);
                    }
                }

                if (!waterfiedGrid[x]) waterfiedGrid[x] = [];
                waterfiedGrid[x][y] = true;
                this.setBlock(x, y, crock.emptyBlock);
                waterSurfacePoints.splice(waterSurfacePoints.indexOf(wsp), 1);
            });
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
                }
            }
        }
    }
    getBlock(x, y){
        if(!this.grid[x]) return crock.emptyBlock;
        if(!this.grid[x][y]) return crock.emptyBlock;
        return this.grid[x][y];
    }
    setBlock(x, y, block){
        if(!this.grid[x]) this.grid[x] = [];
        this.grid[x][y] = block;
    }
};
