'use strict';

const main = require('./main_func.js');
const globalVars = require('./vars.js');
const width = globalVars.WIDTH;
const height = globalVars.HEIGHT;

const fs = require('fs');
const { createCanvas, createImageData } = require('canvas');

//const width = 1024, height = 768;
let canvas = createCanvas(width, height);
let context = canvas.getContext('2d');
//let image = createImageData(width, height);

if (process.argv.length < 3) {
  console.log('Usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1);
}

// Read the file and print its contents.
let filename = process.argv[2];

let rawdata = fs.readFileSync(filename);
let tree = JSON.parse("{" + rawdata + "}");
let data = main.generateArrayFromJson(canvas, tree);

main.generateImage(canvas, data);

// let n = 0; // Index inside the image array
// for (let y = 0; y < canvas.height; y++) {
//     for (let x = 0; x < canvas.width; x++, n += 4) {
//         image.data[n]   = data[n];
//         image.data[n+1] = data[n+1];
//         image.data[n+2] = data[n+2];
//         image.data[n+3] = data[n+3];
//     }
// }
//context.putImageData(image, 0, 0);

// console.log(data[0], data[1], data[2]);
if(data[0] === undefined) console.log("An error occured, please verify your input file.");

let buffer = canvas.toBuffer('image/png');
fs.writeFileSync('image.png', buffer);
