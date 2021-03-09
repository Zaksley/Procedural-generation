'use strict';

// Global variables
let MAX_ARGUMENTS = 50;
const WIDTH = 350, HEIGHT = 250;
let CANVAS = document.getElementById('canvas');
CANVAS.width = width; CANVAS.height = height; 

// Color dictionnary

// Uses texture function with arguments args to print on canvas
function generateImage(canvas, texture, ...args) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);
    
    let map = [], column = [];
    let nbArgs = 0;
    let textureFunction = texture;
    while(typeof(textureFunction) === 'function' && nbArgs <= MAX_ARGUMENTS){
	if(typeof(textureFunction(args[0])) === 'function'){
	    textureFunction = textureFunction(args[0]);
	}
	console.log(typeof(textureFunction));
	params.shift();
	count++;
    }
    for (let n = 0, x = 0; x < width; x++) {
	column = [];
	for (let y = 0; y < height; y++) {
	    let pixel = textureFunction(x,y);
	}
	map.push(column);
    }
    return map;
}
