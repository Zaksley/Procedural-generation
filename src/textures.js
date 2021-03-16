'use strict';

function solid(i, j)
{
    return [0, 0, 0, 255]; 
};

function gradient_Horizontal(i, j)
{
    return [Math.floor(255*j/height), Math.floor(255*j/height), Math.floor(255*j/height), 255];
};

function gradient_Vertical(i, j)
{
    return [Math.floor(255*i/width), Math.floor(255*i/width), Math.floor(255*i/width), 255];
};


function regulatePavage_square(i, j, nbSquare_x, nbSquare_y)
{
    let sizeSquare_x = width/nbSquare_x; 
    let sizeSquare_y = height/nbSquare_y;

    let coordinate_x = Math.floor(i/sizeSquare_x);
    let coordinate_y = Math.floor(j/sizeSquare_y);

    if (coordinate_x % 2 == 0 && coordinate_y  % 2 != 0)   return [255, 255, 255, 255]; 
    if (coordinate_x % 2 != 0 && coordinate_y  % 2 == 0)   return [255, 255, 255, 255]; 

    return [0, 0, 0, 255]; 
};

/* Texture : multiple horizontal black-to-white gradients
 *
 * @param width canvas width
 * @param n number of repetitions
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_multiHorizGrad(width){
    return function (n) { 
    return function (x,y) {
        return [Math.floor(255*((n*x)%width)/width),
                Math.floor(255*((n*x)%width)/width),
                Math.floor(255*((n*x)%width)/width), 
                255];
    }; };
};

/* Texture : multiple horizontal color1-to-color2 gradients
 * 
 * @param width canvas width
 * @param n number of repetitions
 * @param color1 starting color (rgba 4-upple format)
 * @param color2 ending color (rgba 4-upple format)
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_multiHorizColorGrad(width){
    return function (n) {
    return function (color1) {
    return function (color2) {
    return function (x,y) {
        return [0,0,0,0].map((e,i) => 
            Math.floor(color1[i]*((n*(width-x))%width)/width + color2[i]*((n*x)%width)/width));
    }; }; }; };
};


function texture_perlinNoise(){
    return function (x, y) { 

        function interpolate(v0, v1, w) {
            return (v1 - v0) * w + v0; 
        }

        function dotGradient(xx, yy, x, y) {

            // Compute distance
            let dx = x - xx;
            let dy = y - yy; 

            return (dx*Math.cos(Math.random() * 10) + dy*Math.sin(Math.random() * 10 ) ); 
        }

        function perlin(x, y) {
            const x1 = x + 1;
            const y1 = y + 1;

            let n0 = dotGradient(x,  y, x, y);
            let n1 = dotGradient(x1,  y, x, y);
            const interpolate_x = interpolate(n0, n1, Math.random()); 

            n0 = dotGradient(x, y1, x, y); 
            n1 = dotGradient(x1, y1, x, y); 
            const interpolate_y = interpolate(n0, n1, Math.random()); 

            const value = interpolate(interpolate_x, interpolate_y, Math.random());
            console.log(value); 
            return value; 
        }

        return (255 * perlin(x, y)); 
    };
}