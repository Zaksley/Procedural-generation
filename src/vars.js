'use strict';

// Global variables
let MAX_ARGUMENTS = 50;
// FINAL IMAGE : 1024 x 768 (500ko max)
const WIDTH = 500;
const HEIGHT = 500;

const COLORS = {
    blue: [0, 0, 255, 255],
    red: [255, 0, 0, 255],
    pink: [255, 192, 203, 255],
    green: [0, 255, 0, 255],
    black: [0, 0, 0, 255],
    white: [255, 255, 255, 255],
    orange: [255, 128, 0, 255],
    cyan: [0, 255, 128, 255],
    grey: [127,127,127,255],
    silver: [192,192,192,255],
};

// Exports
exports.MAX_ARGUMENTS   = MAX_ARGUMENTS;
exports.WIDTH           = WIDTH;
exports.HEIGHT          = HEIGHT;
exports.COLORS          = COLORS;