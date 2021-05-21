'use strict';

// Global variables
const globalVars = require('../vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;
const COLORS = globalVars.COLORS;

const tools = require("./tools_for_textures.js");
const get_offset = tools.get_offset;
const ij2xy = tools.ij2xy;

/* Texture : paving of color1 and color2 triangles
 *
 * @param dict.size      side size of triangles
 * @param dict.colors    tiling colors (2-element array)
 * @param (i,j)          coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position   
*/

function texture_triangleTiling(dict) {
    const size =    dict['size']    || 80;
    const colors =  dict['colors']  || [];
    const color1 =  dict['color1']  || colors[0] || COLORS.blue;
    const color2 =  dict['color2']  || colors[1] || COLORS.cyan;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;

        const offset = get_offset(j, 2 * h, 0.5, size / 2);

        const [x, y] = ij2xy((i + offset), size, j, h);
        const p = y / h;

        if (x > p * size / 2 && x - size / 2 < (1 - p) * size / 2)
            return color1;
        else
            return color2;
    };
}

/* Texture : paving of color1, color2 and color3 hexagons
 *
 * @param dict.size     side size of hexagons
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position   
*/
function texture_hexagonTiling(dict) {
    const size =    dict['size']    || 80;
    const colors =  dict['colors']  || [];
    const color1 =  dict['color1']  || colors[0] || COLORS.cyan;
    const color2 =  dict['color2']  || colors[1] || COLORS.orange;
    const color3 =  dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;

        const offset = get_offset(i, 3 * size, 0.5, h);
        const [x, y] = ij2xy(i, 3 * size / 2, (j + offset), 2 * h);

        const cond1 = (j + 3 * offset) % (6 * h) > 2 * h;
        const cond2 = (j + 3 * offset) % (6 * h) > 4 * h;

        const realcolor1 = cond1 ? cond2 ? color3 : color2 : color1;
        const realcolor2 = cond1 ? cond2 ? color1 : color3 : color2;
        const realcolor3 = cond1 ? cond2 ? color2 : color1 : color3;

        const p1 = 1 - y / h;
        const p2 = (y - h) / h;
        if (x > p1 * size / 2 && x > p2 * size / 2)
            return realcolor1;
        else if (y < h)
            return realcolor2;
        else
            return realcolor3;
    };
}

/* Texture : checkerboard of color1 and color2 rectangles
 *
 * @param dict.width    canvas width
 * @param dict.height   canvas height
 * @param dict.rows     number of rows
 * @param dict.columns  number of columns
 * @param dict.colors   tiling colors (2-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (x,y) position   
*/
function texture_squareTiling(dict) {

    const width =   dict['width']   || WIDTH;
    const height =  dict['height']  || HEIGHT;
    const rows =    dict['rows']    || 5;
    const columns = dict['columns'] || 5;
    const colors =  dict['colors']  || [];
    const color1 =  dict['color1']  || colors[0] || COLORS.cyan;
    const color2 =  dict['color2']  || colors[1] || COLORS.orange;

    return function (i, j) {
        const size_x = width / columns;
        const size_y = height / rows;

        const [x, y] = ij2xy(i, 2 * size_x, j, 2 * size_y);

        if (y < size_y) {
            if (x < size_x)
                return color1;
            else
                return color2;
        } else {
            if (x < size_x)
                return color2;
            else
                return color1;
        }
    };
}

// Exports
exports.triangleTiling =    texture_triangleTiling;
exports.hexagonTiling =     texture_hexagonTiling;
exports.squareTiling =      texture_squareTiling;