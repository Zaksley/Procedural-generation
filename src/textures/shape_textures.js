'use strict';

// Global variables
const globalVars = require('../vars.js');
const COLORS = globalVars.COLORS;
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;

const tools = require("./tools_for_textures.js");
const isInShape = tools.isInShape;

function texture_testInShape(dict) {

   let coords = dict['coords']   || [];
   //const coords = [[100, 100], [200, 125], [300, 125], [400, 100], [375, 200], [375, 300],  [400, 400], [300, 375], [200, 375], [100, 400], [125, 300], [125, 200]];
   coords = [[100, 100], [225, 200], [250, 150], [275, 200], [400, 100], [300, 225], [350, 250], [300, 275], [400, 400], [275, 300], [250, 350], [225, 300], [100, 400], [200, 275], [150, 250], [200, 225]];
   const testIsInShape = isInShape(coords);
   return function(x, y) {
      if (testIsInShape(x, y))  
         return COLORS.black;
      return COLORS.grey;
   };
}

/* Texture : texture star
 *
 * @param dict.branches number of branches
 * @param dict.size radius of the inner circle and 1/3 of the outer one
 * @param dict.center center coordinates
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_star(dict) {
    const n = dict['branches']      || 5;
    const r = dict['size']          || 50;
    const center = dict['center']   || [];
    const center_x = center[0]      || dict['centerx'] || WIDTH / 2;
    const center_y = center[1]      || dict['centery'] || HEIGHT / 2;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;
    const coords = [];

    for(let k = 0; k < n; k++) {
        coords.push([3 * r * Math.cos(k / n * 2 * Math.PI) + center_x, 3 * r * Math.sin(k / n * 2 * Math.PI) + center_y]);
        coords.push([r * Math.cos((k + 1 / 2)/ n * 2 * Math.PI) + center_x, r * Math.sin((k + 1 / 2) / n * 2 * Math.PI) + center_y]);
    }

    const testIsInShape = isInShape(coords);
    return function(x, y) {
        if (testIsInShape(x, y))
            return color1;
        return color2;
    };
}

/* Texture : texture star
 *
 * @param dict.branches number of branches
 * @param dict.size radius of the inner circle and 1/3 of the outer one
 * @param dict.center center coordinates
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_doubleStar(dict) {
    const n = dict['branches']      || 5;
    const r1 = dict['size']         || 50;
    const r2 = dict['size2']        || 70;
    const center = dict['center']   || [];
    const center_x = center[0]      || dict['centerx'] || WIDTH / 2;
    const center_y = center[1]      || dict['centery'] || HEIGHT / 2;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;
    const coords = [];

    for(let k = 0; k < n; k++) {
        coords.push([3 * r1 * Math.cos(k / n * 2 * Math.PI) + center_x, 3 * r1 * Math.sin(k / n * 2 * Math.PI) + center_y]);
        coords.push([r1 * Math.cos((k + 1 / 4)/ n * 2 * Math.PI) + center_x, r1 * Math.sin((k + 1 / 4) / n * 2 * Math.PI) + center_y]);
        coords.push([3 * r2 * Math.cos((k + 1 / 2) / n * 2 * Math.PI) + center_x, 3 * r2 * Math.sin((k + 1 / 2) / n * 2 * Math.PI) + center_y]);
        coords.push([r1 * Math.cos((k + 3 / 4)/ n * 2 * Math.PI) + center_x, r1 * Math.sin((k + 3 / 4) / n * 2 * Math.PI) + center_y]);
    }

    const testIsInShape = isInShape(coords);
    return function(x, y) {
        if (testIsInShape(x, y))
            return color1;
        return color2;
    };
}

function texture_regularShape(dict) {
    const n = dict['branches']      || 4;
    const r = dict['r']             || dict['size'] / (2 * Math.sin(Math.PI / n)) || 100;
    const center = dict['center']   || [];
    const center_x = center[0]      || dict['centerx'] || WIDTH / 2;
    const center_y = center[1]      || dict['centery'] || HEIGHT / 2;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;

    const coords = [];

    for(let k = 0; k < n; k++) 
        coords.push([r * Math.cos(k / n * 2 * Math.PI) + center_x, r * Math.sin(k / n * 2 * Math.PI) + center_y]);

    const testIsInShape = isInShape(coords);
    return function(x, y) {
        if (testIsInShape(x, y))
            return color1;
        return color2;
    };
}

// Exports
exports.testInShape 	= texture_testInShape;
exports.star 			= texture_star;
exports.doubleStar 		= texture_doubleStar;
exports.regularShape 	= texture_regularShape;