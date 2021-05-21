'use strict';

// Global variables
const globalVars = require('../vars.js');
const COLORS = globalVars.COLORS;

const tools = require("./tools_for_textures.js");
const get_offset = tools.get_offset;
const ij2xy = tools.ij2xy;

/* Texture : Caire Tiling
 *
 * @param dict.size     side size of pentagons
 * @param dict.angle    angle of the pentagon paving
 * @param dict.colors   tiling colors (4-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_caireTiling(dict) {
    const size =    dict['size']    || 80;
    const angle =   dict['angle']   || 135;
    const colors =  dict['colors']  || [];
    const color1 =  dict['color1']  || colors[0] || COLORS.cyan;
    const color2 =  dict['color2']  || colors[1] || COLORS.orange;
    const color3 =  dict['color3']  || colors[2] || COLORS.blue;
    const color4 =  dict['color4']  || colors[3] || COLORS.pink;

    return function (i, j) {
        const alpha = angle * Math.PI / 180;
        const small_h = Math.cos(alpha / 2) * size;
        const big_h = Math.sin(alpha / 2) * size;
        const offset = get_offset(j, 4 * big_h, 0.5, 2 * big_h);

        const [x, y] = ij2xy(i + offset, 4 * big_h, j, 2 * big_h);

        const p1 = y / (2 * big_h);
        const p2 = 1 - (y - (big_h - small_h)) / (2 * small_h);

        const cond1 = (x - (big_h - small_h)) < p1 * (2 * small_h) || (x - (3 * big_h - small_h) > (1 - p1) * (2 * small_h));
        const cond2 = (x < p2 * (2 * big_h) || x - (2 * big_h) > (1 - p2) * (2 * big_h));
        const cond3 = (x < 2 * big_h);

        if (cond1 && cond2)
            return color1;
        else if (cond1 && cond3 || cond2 && !cond3)
            return color2;
        else if (cond1 && !cond3 || cond2 && cond3)
            return color3;
        else
            return color4;
    };
}

/* Texture pentagon tiling 3 (WORK IN PROGRESS)
 *
 * @param dict.size     side size of pentagons
 * @param dict.angle    angle of the pentagon paving
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_pentagonTiling3(dict) {
    const size =    dict['size']    || 80;
    const angle =   dict['angle']   || 110;
    const colors =  dict['colors']  || [];
    const colorU =  dict['color1']  || colors[0] || COLORS.cyan;
    const colorL =  dict['color2']  || colors[1] || COLORS.black;
    const colorR =  dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;

        const offset = get_offset(j, 3 * size, 0.5, h);
        const [x, y] = ij2xy(i + offset, 2 * h, j, 3 * size / 2);

        const realAngle = angle % 120;
        const realColorU = (angle % 360 < 240) ? (angle % 360 < 120) ? colorU : colorR : colorL;
        const realColorL = (angle % 360 < 240) ? (angle % 360 < 120) ? colorL : colorU : colorR;
        const realColorR = (angle % 360 < 240) ? (angle % 360 < 120) ? colorR : colorL : colorU;

        const alpha = realAngle * Math.PI / 180;

        const p1 = (size / 2 - y) / Math.sin(alpha);
        const p2 = (size / 2 - y) / Math.sin(alpha - 2 * Math.PI / 3);
        const p3 = (size / 2 - y) / Math.sin(alpha + 2 * Math.PI / 3);
        const p4 = (y - size) / (size / 2);
        const p5 = (2 * size - y) / Math.sin(alpha);
        const p6 = (2 * size - y) / Math.sin(alpha + 2 * Math.PI / 3);

        const cond1 = x - h < p1 * Math.cos(alpha);
        const cond2 = x - h < p2 * Math.cos(alpha - 2 * Math.PI / 3);
        const cond3 = (realAngle > 60) ? x - h < p3 * Math.cos(alpha + 2 * Math.PI / 3) : x - h > p3 * Math.cos(alpha + 2 * Math.PI / 3);

        const cond4 = x < p4 * h;
        const cond5 = x - h > (1 - p4) * h;
        const cond6 = x - 2 * h < p5 * Math.cos(alpha);
        const cond7 = x < p5 * Math.cos(alpha);
        const cond8 = (realAngle > 60) ? false : x - 2 * h < p6 * Math.cos(alpha + 2 * Math.PI / 3);

        if (cond1 && cond3 && !cond4 || cond5 && cond6 && !cond8 || cond4 && cond7)
            return realColorU;
        else if (!cond2 && !(cond8 && cond5) || cond4 && !cond8 || cond5 && !cond6 && !cond8)
            return realColorR;
        else
            return realColorL;
    };
}

/* Texture pentagon tiling 4
 *
 * @param dict.size     side first size of pentagons
 * @param dict.size2    side second size of pentagons
 * @param dict.angle    angle of the pentagon paving
 * @param dict.colors   tiling colors (4-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_pentagonTiling4(dict) {
    const a =       dict['size']    || 50;
    const b =       dict['size2']   || 70;
    const angle =   dict['angle']   || 120;
    const colors =  dict['colors']  || [];
    const color1 =  dict['color1']  || colors[0] || COLORS.blue;
    const color2 =  dict['color2']  || colors[1] || COLORS.red;
    const color3 =  dict['color3']  || colors[2] || COLORS.orange;
    const color4 =  dict['color4']  || colors[3] || COLORS.cyan;

    return function (i, j) {
        const alpha = (angle - 90) * Math.PI / 180;

        const x_offset = Math.floor(j / (a + b * (Math.cos(alpha) + Math.sin(alpha)))) * (a + b * (Math.sin(alpha) - Math.cos(alpha)));
        const y_offset = Math.floor((i + x_offset) / (a + b * (Math.cos(alpha) + Math.sin(alpha)))) * (2 * b * Math.cos(alpha));
        const [x, y] = ij2xy(i + x_offset, a + b * (Math.cos(alpha) + Math.sin(alpha)), j + y_offset, a + b * (Math.cos(alpha) + Math.sin(alpha)));

        const p1 = (y - b * Math.cos(alpha)) / (b * Math.sin(alpha));
        const p2 = (y - a) / (b * (Math.cos(alpha) + Math.sin(alpha)) - a);
        if ((x + b * Math.sin(alpha) > p1 * b * Math.cos(alpha)) && x < a && x - b * (Math.cos(alpha) - Math.sin(alpha)) < (1 - p2) * (a + b * (Math.sin(alpha) - Math.cos(alpha))))
            return color1;
        const p3 = (y - a) / (b * Math.sin(alpha));
        const p4 = 1 - (y - (a + b * (Math.sin(alpha) - Math.cos(alpha)))) / (b * Math.cos(alpha));
        const p5 = y / (a + b * (Math.cos(alpha) - Math.sin(alpha)));
        if (x - 2 * a < p5 * (b * (Math.cos(alpha) + Math.sin(alpha)) + a)) {
            if (x - a > p3 * b * Math.cos(alpha)) {
                if (x - (a + b * Math.cos(alpha)) < p4 * b * Math.sin(alpha))
                    return color2;
                else
                    return color1;
            }
            else if (x > b * (Math.cos(alpha) - Math.sin(alpha)) && x - (a + b * Math.cos(alpha)) < p4 * b * Math.sin(alpha))
                return color3;
        }
        return color4;
    };

}

/* Texture : 3D cube (rhombile tiling)
 *
 * @param dict.size     side first size of shapes
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_cubeTiling(dict) {
    const size =    dict['size']    || 80;
    const colors =  dict['colors']  || [];
    const colorU =  dict['color1']  || colors[0] || COLORS.cyan;
    const colorL =  dict['color2']  || colors[1] || COLORS.orange;
    const colorR =  dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 3 * size, 0.5, h);

        const [x, y] = ij2xy(i + offset, 2 * h, j, 3 * size / 2);

        const p1 = 2 * y / size;
        const p2 = 2 * (y - size) / size;
        if (x > p1 * h && x - h < (1 - p1) * h)
            return colorU;
        else if (x < p2 * h || x - h > (1 - p2) * h)
            return colorU;
        else if (x < h)
            return colorL;
        else
            return colorR;
    };
}

/* Texture : 3D gambar tiling
 *
 * @param dict.size     side first size of shapes
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_gambarTiling(dict) {
    const size =    dict['size']    || 60;
    const colors =  dict['colors']  || [];
    const colorU =  dict['color1']  || colors[0] || COLORS.cyan;
    const colorL =  dict['color2']  || colors[1] || COLORS.orange;
    const colorR =  dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 3 * size, 0.5, 3 * h);

        const [x, y] = ij2xy(i + offset, 6 * h, j, 3 * size / 2);

        const p1 = 2 * y / size;
        const p2 = 2 * (y - size) / size;
        if (x - 2 * h > p1 * h && x - 5 * h < (1 - p1) * h)
            return colorU;
        else if (x < p2 * h || (x - h > (1 - p2) * h && x - 2 * h < p2 * h) || x - 5 * h > (1 - p2) * h)
            return colorU;
        else if (x < h || (x > 2 * h && x < 4 * h))
            return colorL;
        else
            return colorR;
    };
}

// Exports
exports.caireTiling     = texture_caireTiling;
exports.pentagonTiling3 = texture_pentagonTiling3;
exports.pentagonTiling4 = texture_pentagonTiling4;
exports.cubeTiling      = texture_cubeTiling;
exports.gambarTiling    = texture_gambarTiling;