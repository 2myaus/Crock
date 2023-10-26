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
    ctx.clearRect(0, 0, 1000, 1000);
    const cave = new crock.Cave(1000, 1000);
    cave.populateDPoints();
    cave.populateDensities();
    for(let x = 0; x < cave.width; x++){
        for(let y = 0; y < cave.height; y++){
            const block = cave.getBlock(x, y);
            let drawDensity = Math.floor((block.density / 5) * 255);
            if(drawDensity > 255){drawDensity = 255};
            ctx.fillStyle = "rgb("+drawDensity.toString()+", "+drawDensity.toString()+", "+drawDensity.toString()+")";
            ctx.fillRect(x, y, 1, 1);
        }
    }
}