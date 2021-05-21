'use strict';

const main = require('./main_func.js');
const globalVars = require('./vars.js');
const width = globalVars.WIDTH;
const height = globalVars.HEIGHT;

const fs = require('fs');
const { createCanvas } = require('canvas');

let canvas = createCanvas(width, height);

if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' FILENAME');
    process.exit(1);
}

// Read the file and print its contents.
let filename = process.argv[2];

let imgname = process.argv[3];
if (typeof (imgname) === 'undefined' || imgname === '') {
    imgname = "image.png";
}

let rawdata = fs.readFileSync(filename);
let tree = JSON.parse("{" + rawdata + "}");
let data = main.generateArrayFromJson(canvas, tree);

main.generateImage(canvas, data);

if (data[0] === undefined) 
    console.log("An error occured, please verify your input file.");

let buffer = canvas.toBuffer('image/png');
fs.writeFileSync(imgname, buffer);
