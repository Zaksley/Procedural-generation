'use strict';

// Global variables
let MAX_ARGUMENTS = 50;
const WIDTH = 350, HEIGHT = 250;
let CANVAS = document.getElementById('canvas');
CANVAS.width = width; CANVAS.height = height; 

// Color dictionnary
const couleurs = {
    blue: [0, 0, 255, 255], 
    red: [255, 0, 0, 255],
    pink: [255, 192, 203, 255],
    green: [0, 255, 0, 255],
    black: [0, 0, 0, 255], 
    white: [255, 255, 255, 255],     
}

//////// MAIN FUNCTIONS ///////////

// Uses texture function with arguments args to print on canvas
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
	}
	args.shift();
	nbArgs++;
    }

    // Texture application
    let column = [];
    for (let n = 0, x = 0; x < canvas.width; x++) {
	column = [];
	for (let y = 0; y < canvas.height; y++, n += 4) {
	    let pixel = textureFunction(x,y);
	    image.data[n]   = pixel[0]; // Red channel
	    image.data[n+1] = pixel[1]; // Green channel
	    image.data[n+2] = pixel[2]; // Blue channel
	    image.data[n+3] = pixel[3]; // Alpha channel
	}
    }
    
    // Image printing
    context.putImageData(image, 0, 0);
}


///////// TESTS (temporary) //////////

// Texture function for horizontal bi-color gradient (does stuff with color)
function textureHorizontalGradient(width) {
    return function (color) {
	return function (x,y) {
	    return [Math.floor(255*color/width), 
		    Math.floor(255*x/width), 
		    Math.floor(255*x/width), 255];
	};
    };
}

generateImage(CANVAS, textureHorizontalGradient, canvas.width, 128);
