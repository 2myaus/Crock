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

let width = 1000;
let height = 1000;

let pixelsize = 1;

function drawDensitySquares(){
    canvas.width = width * pixelsize;
    canvas.height = height * pixelsize;

    ctx.clearRect(0, 0, width * pixelsize, height * pixelsize);
    const cave = new crock.Cave(width, height);

    const startTime = Date.now();
    let lastTime = startTime;

    cave.populateDPoints();
    console.log(`Point population took ${(Date.now() - lastTime)} ms`);
    lastTime = Date.now();
    
    cave.populateDensities();
    console.log(`Block density took ${(Date.now() - lastTime)} ms`);
    lastTime = Date.now();

    cave.erodeBlocks();
    console.log(`Erosion took ${(Date.now() - lastTime)} ms`);
    lastTime = Date.now();

    //cave.smoothBlocks();
    console.log(`Smoothing took ${(Date.now() - lastTime)} ms`);

    for(let x = 0; x < cave.width; x++){
        for(let y = 0; y < cave.height; y++){
            const block = cave.getBlock(x, y);
            let drawDensity = Math.floor((block.density / 5) * 255);
            if(drawDensity > 0){drawDensity = 255};
            ctx.fillStyle = "rgb("+Math.floor(drawDensity * 0.5).toString()+", "+Math.floor(drawDensity * 0.5).toString()+", "+drawDensity.toString()+")";
            ctx.fillRect(x * pixelsize, y * pixelsize, pixelsize, pixelsize);
        }
    }
    const dTime = Date.now() - startTime;
    console.log(`Finished! Took ${dTime}ms (${(dTime * 1000 / (width * height))}ms per 1000 pixels)`);
}

document.getElementById("drawButton").onclick = drawDensitySquares;
