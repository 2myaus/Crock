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
        const dPointFrequency = 0.001;
        const dPointAvgRadius = 30;
        const dPointAvgDeviation = 10;
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
        const waterDensity = 0.3;
        const waterPoints = Math.floor(waterDensity * this.width * this.height);
        let waterfiedGrid = [];
        let waterSurfacePoints = [];
        waterSurfacePoints.push([0, 0]);
        
        for(let i = 0; i < waterPoints; i++){
            let weakestPoint = undefined;
            waterSurfacePoints.forEach((wsp) => {
                const connectingPoints = [
                    [wsp[0] - 1, wsp[1]],
                    [wsp[0] + 1, wsp[1]],
                    [wsp[0], wsp[1] - 1],
                    [wsp[0], wsp[1] + 1]
                ];
                connectingPoints.forEach((conPoint) => {
                    if(waterfiedGrid[conPoint[0]]){
                        if(waterfiedGrid[conPoint[0]][conPoint[1]]){
                            return;
                        }
                    }
                    if(!weakestPoint){
                        weakestPoint = conPoint;
                        return;
                    }
                    const weakestBlock = this.getBlock(weakestPoint[0], weakestPoint[1]);
                    if((this.getBlock(conPoint[0], conPoint[1]).density < weakestBlock.density)){
                        weakestPoint = conPoint;
                    }
                });
            });
            if(!waterfiedGrid[weakestPoint[0]]) waterfiedGrid[weakestPoint[0]] = [];
            waterfiedGrid[weakestPoint[0]][weakestPoint[1]] = true;
            const connectingPoints = [
                [weakestPoint[0] - 1, weakestPoint[1]],
                [weakestPoint[0] + 1, weakestPoint[1]],
                [weakestPoint[0], weakestPoint[1] - 1],
                [weakestPoint[0], weakestPoint[1] + 1]
            ];
            connectingPoints.forEach((conPoint) => {
                if(waterfiedGrid[conPoint[0]]){
                    if(waterfiedGrid[conPoint[0]][conPoint[1]]){
                        return;
                    }
                }
                waterSurfacePoints.push(weakestPoint);
                if(!waterfiedGrid[conPoint[0]]){
                    waterfiedGrid[conPoint[0]] = [];
                }
                waterfiedGrid[conPoint[0]][conPoint[1]] = true;
            });
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