'use strict';

// Global variables
let MAX_ARGUMENTS = 50;
const WIDTH = 550, HEIGHT = 450;
let CANVAS = document.getElementById('canvas');
CANVAS.width = WIDTH; CANVAS.height = HEIGHT; 
let CONTEXT = CANVAS.getContext("2d");
let IMAGE = CONTEXT.createImageData(CANVAS.width, CANVAS.height);

// Color dictionnary
const colors = {
    blue: [0, 0, 255, 255], 
    red: [255, 0, 0, 255],
    pink: [255, 192, 203, 255],
    green: [0, 255, 0, 255],
    black: [0, 0, 0, 255], 
    white: [255, 255, 255, 255],
    orange: [255, 128, 0, 255],
    cyan: [0, 255, 128, 255]    
};

//////// MAIN FUNCTIONS ///////////

/* Generates an image data array from a texture function
 *
 * @param canvas the canvas used for sizing
 * @param texture a texture function to generate
 * @param ...args a list of arguments for the texture function
 * @precond canvas must be a <canvas> html element
 * @return an image data array (of size width*height*4)
 */
 // TODO : réfléchir à un dictionnaire au lieu d'une liste d'arguments ?
function generateTexture(canvas, texture, ...args) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);
    
    // Texture function definition
    let nbArgs = 0;
    let textureFunction = texture;
    while(typeof(textureFunction) === 'function' && nbArgs <= MAX_ARGUMENTS){
    	// Verifies that next argument is not the last block
    	if(typeof(textureFunction(args[0])) === 'function'){
    	    textureFunction = textureFunction(args[0]);
    	};
    	args.shift();
    	nbArgs++;
    };

    // Texture application
    for (let n = 0, y = 0; y < canvas.height; y++) {
    	for (let x = 0; x < canvas.width; x++, n += 4) {
    	    let pixel = textureFunction(x,y);
    	    image.data[n]   = pixel[0]; // Red channel
    	    image.data[n+1] = pixel[1]; // Green channel
    	    image.data[n+2] = pixel[2]; // Blue channel
    	    image.data[n+3] = pixel[3]; // Alpha channel
    	};
    };
    
    return image.data;
};

/* Generates an animation from a texture function
 *
 * @param canvas the canvas used for sizing
 * @param texture a texture function to generate
 * @param ...args a list of arguments for the texture function
 * @precond canvas must be a <canvas> html element
 * @return nothing
 */
function generateMakeFrame(canvas, texture, ...args) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);
    const RGB = image.data;

    // Texture function definition
    let nbArgs = 0;
    let textureFunction = texture;

    while(typeof(textureFunction) === 'function' && nbArgs <= MAX_ARGUMENTS){
    	// Verifies that next argument is not the last block
    	if(typeof(textureFunction(args[0])) === 'function'){
    	    textureFunction = textureFunction(args[0]);
    	};
    	args.shift();
    	nbArgs++;
    };

    makeFrame();
    
    /* Creates an animation on main canvas
     *
     * @param time timestamp of current image
     * @return nothing
     */
    function makeFrame(time) {
    let dt = 0.005 * time;
    for (let n = 0, y = 0; y < canvas.height; y++) {
	for (let x = 0; x < canvas.width; x++, n += 4) {
	    let pixel = textureFunction(x,y,dt);
	    image.data[n]   = pixel[0]; // Red channel
	    image.data[n+1] = pixel[1]; // Green channel
	    image.data[n+2] = pixel[2]; // Blue channel
	    image.data[n+3] = pixel[3]; // Alpha channel
	};
    };

    context.putImageData(image, 0, 0); requestAnimationFrame(makeFrame);
    };
};

/* Prints an image on a canvas
 *
 * @param canvas the canvas for the image to be printed on
 * @param data an image data array
 * @precond canvas must be a <canvas> html element
 * @precond data must be of size (canvas.width)*(canvas.height)*4 
 * @return nothing
 */
function generateImage(canvas, data) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);

    for (let i = 0; i < image.data.length; i++) image.data[i] = data[i];
    context.putImageData(image, 0, 0);
}

///////// TESTS //////////

// ========== TEXTURE (only one) ==========
// Usage : let data = generateTexture(CANVAS, [texture], <...args>);
let data = 
    //generateImage(CANVAS, texture_multiHorizGrad, CANVAS.width, 10);
    //generateTexture(CANVAS, texture_multiHorizColorGrad, CANVAS.width, 1, colors.orange, colors.cyan, 90);
    generateTexture(CANVAS, texture_hexagonTiling, 20, colors.cyan, colors.orange, colors.blue);
// ========================================

// ===== FILTERS (repeat for successive filters) =====
// Usage : data = [filter](data)<...(args)>);
data = filter_blur(data)(WIDTH)(HEIGHT)(10);
data = filter_cyanColoration(data)(0.5);
// ===================================================

// !! Do not touch
generateImage(CANVAS, data);




