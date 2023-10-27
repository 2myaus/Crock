const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext("2d");

function drawDensities(){
    ctx.clearRect(0, 0, 1000, 1000);
    const cave = new crock.Cave(1000, 1000);
    cave.populateDPoints();
    ctx.strokeStyle = "black";
    cave.dPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.radius, 0, 2*Math.PI);
        ctx.stroke();
    });
}

function drawDensitySquares(){
    ctx.clearRect(0, 0, 500, 500);
    const cave = new crock.Cave(500, 500);
    cave.populateDPoints();
    cave.populateDensities();
    cave.erodeBlocks();
    //cave.smoothBlocks();
    for(let x = 0; x < cave.width; x++){
        for(let y = 0; y < cave.height; y++){
            const block = cave.getBlock(x, y);
            let drawDensity = Math.floor((block.density / 5) * 255);
            if(drawDensity > 0){drawDensity = 255};
            ctx.fillStyle = "rgb("+Math.floor(drawDensity * 0.5).toString()+", "+Math.floor(drawDensity * 0.5).toString()+", "+drawDensity.toString()+")";
            ctx.fillRect(x, y, 1, 1);
        }
    }
}

drawDensitySquares();
