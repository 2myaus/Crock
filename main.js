const canvas = document.getElementsByTagName("canvas")[0];
const ctx = canvas.getContext("2d");

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
    cave.populateDensities();
    console.log(`Block density took ${(Date.now() - lastTime)} ms`);
    lastTime = Date.now();

    cave.erodeBlocks();
    console.log(`Erosion took ${(Date.now() - lastTime)} ms`);
    lastTime = Date.now();

    cave.smoothBlocks();
    console.log(`Smoothing took ${(Date.now() - lastTime)} ms`);

    cave.populateMinerality("R");
    cave.populateMinerality("G");
    cave.populateMinerality("B");

    for(let x = 0; x < cave.width; x++){
        for(let y = 0; y < cave.height; y++){
            const block = cave.getBlock(x, y);
            let drawDensity = Math.floor((block.density / 5) * 255);

            let r = 0;
            let g = 0;
            let b = 0;

            if(block["R"]){
                r = block["R"];
            }
            if(block["G"]){
                g = block["G"];
            }
            if(block["B"]){
                b = block["B"];
            }
            r *= drawDensity;
            g *= drawDensity;
            b *= drawDensity;

            r = Math.floor(r);
            g = Math.floor(g);
            b = Math.floor(b);
            
            if(r > 255) r = 255;
            if(g > 255) g = 255;
            if(b > 255) b = 255;

            ctx.fillStyle = "rgb("+r.toString()+", "+g.toString()+", "+b.toString()+")";
            ctx.fillRect(x * pixelsize, y * pixelsize, pixelsize, pixelsize);
        }
    }
    const dTime = Date.now() - startTime;
    console.log(`Finished! Took ${dTime}ms (${(dTime * 1000 / (width * height))}ms per 1000 pixels)`);
}

document.getElementById("drawButton").onclick = drawDensitySquares;
