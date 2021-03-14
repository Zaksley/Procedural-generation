'use strict';

// Global variables
let MAX_ARGUMENTS = 50;
const WIDTH = 550, HEIGHT = 450;
let CANVAS = document.getElementById('canvas');
CANVAS.width = WIDTH; CANVAS.height = HEIGHT; 

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

/* Prints a texture on selected canvas
 *
 * @param canvas the canvas used to display the texture
 * @param texture a texture function to display
 * @param ...args a list of arguments for the texture function
 * @precond canvas is a <canvas> html element
 * @return nothing
 */
function generateImage(canvas, texture, ...args) {
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
    let column = [];
    for (let n = 0, y = 0; y < canvas.height; y++) {
	column = [];
	for (let x = 0; x < canvas.width; x++, n += 4) {
	    let pixel = textureFunction(x,y);
	    image.data[n]   = pixel[0]; // Red channel
	    image.data[n+1] = pixel[1]; // Green channel
	    image.data[n+2] = pixel[2]; // Blue channel
	    image.data[n+3] = pixel[3]; // Alpha channel
	};
    };
    
    // Image printing
    context.putImageData(image, 0, 0);
};


///////// TESTS (temporary) //////////

//generateImage(CANVAS, texture_multiHorizGrad, CANVAS.width, 10);
generateImage(CANVAS, texture_multiHorizColorGrad, CANVAS.width, 1, colors.orange, colors.cyan, 90);