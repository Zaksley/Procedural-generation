'use strict';

// Global variables
const globalVars = require('../vars.js');
const COLORS = globalVars.COLORS;

const tools = require("./tools_for_textures.js");
const get_offset = tools.get_offset;
const ij2xy = tools.ij2xy;

const texture_solid = require("./basic_textures.js").solid;
const texture_triangleTiling = require("./regular_tilings_textures.js").triangleTiling;

/* Texture : elongated Triangular
 *
 *
 */
function texture_elongatedTriangular(dict) {
    const size =    dict['size']    || 80;
    const colors =  dict['colors']  || [];
    const colorT1 = dict['color1']  || colors[0] || COLORS.cyan;
    const colorT2 = dict['color2']  || colors[1] || COLORS.orange;
    const colorS1 = dict['color3']  || colors[2] || COLORS.blue;
    const colorS2 = dict['color4']  || colors[3] || COLORS.pink;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 2 * (h + size), 0.5, size / 2);

        const [x, y] = ij2xy(i + offset, size, j, h + size);

        const realcolorS = ((i + offset) % (2 * size) > size) ? colorS2 : colorS1;

        if (y > size) {
            const p = (y - size) / h;
            if (x > p * size / 2 && x < (1 - p / 2) * size)
                return colorT1;
            else
                return colorT2;
        }
        return realcolorS;
    };
}

/* Texture : snub square tiling
 *
 * @param dict.size     side first size of shapes
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_snubSquare(dict) {
    const size =    dict['size']    || 80;
    const colors =  dict['colors']  || [];
    const colorT1 = dict['color1']  || colors[0] || COLORS.cyan;
    const colorT2 = dict['color2']  || colors[1] || COLORS.orange;
    const colorS =  dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 2 * h + size, 0.5, h + size / 2);

        const [x, y] = ij2xy(i + offset, 2 * h + size, j, h + size / 2);

        const p1 = 1 - (2 * y / size);
        if (x < p1 * h)
            return colorT1;
        else if (x - (h + size) > ((1 - p1) * h))
            return colorT2;

        const p2 = y / h;
        if (x - h > p2 * size / 2 && x - (h + size / 2) < (1 - p2) * size / 2)
            return colorT1;

        const p3 = (y - size / 2) / h;
        if (x < p3 * size / 2 || x - (2 * h + size / 2) > (1 - p3) * size / 2)
            return colorT2;

        const p4 = 1 - (2 * (y - h) / size);
        if (x - size / 2 > p4 * h && x - (h + size / 2) < (1 - p4) * h) {
            if (x < h + size / 2)
                return colorT2;
            else
                return colorT1;
        }
        return colorS;
    };
}

/* Texture : truncated square tiling
 *
 * @param dict.size     side size of squares and hexagons
 * @param dict.colors   square's and hexagons' colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position
 */
function texture_truncatedSquare(dict) {
    const size =    dict['size']    || 60;
    const colors =  dict['colors']  || [];
    const colorS =  dict['color1']  || colors[0] || COLORS.cyan;
    const colorH1 = dict['color2']  || colors[1] || COLORS.orange;
    const colorH2 = dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const p = (j % (h + size) > h) ? 1 : j % (h + size) / h;

        const offset = get_offset(j, 2 * (h + size), 0.5, h + size);
        const [x, y] = ij2xy(i + offset, 2 * (h + size), j, h + size);

        const realcolorH1 = (j % (2 * (h + size)) > h + size) ? colorH1 : colorH2;
        const realcolorH2 = (j % (2 * (h + size)) > h + size) ? colorH2 : colorH1;

        if (x > h && x < h + size && y > h)
            return colorS;
        if (x > p * h && x - (h + size) < (1 - p) * h)
            return realcolorH1;
        else
            return realcolorH2;
    };
}

/* Texture : truncated hexagon tiling
 *
 * @param dict.size     side first size of shapes
 * @param dict.colors   tiling colors (4-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_truncatedHexagon(dict) {
    const size =    dict['size']    || 60;
    const colors =  dict['colors']  || [];
    const colorT =  dict['color1']  || colors[0] || COLORS.cyan;
    const colorH1 = dict['color2']  || colors[1] || COLORS.orange;
    const colorH2 = dict['color3']  || colors[2] || COLORS.blue;
    const colorH3 = dict['color4']  || colors[3] || COLORS.pink;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 2 * (2 * h + 1.5 * size), 0.5, size + h);

        // changing the color in order to match the pattern
        const cond1 = ((i + 3 * offset) % (3 * (2 * (size + h))) > (2 * (size + h)));
        const cond2 = ((i + 3 * offset) % (3 * (2 * (size + h))) > 2 * (2 * (size + h)));
        const realcolorH1 = cond1 ? (cond2 ? colorH3 : colorH2) : colorH1;
        const realcolorH2 = cond1 ? (cond2 ? colorH1 : colorH3) : colorH2;
        const realcolorH3 = cond1 ? (cond2 ? colorH2 : colorH1) : colorH3;

        const [x, y] = ij2xy(i + offset, 2 * (size + h), j, (2 * h + 1.5 * size));
        if (y < size / 2) {
            const p1 = 1 - (y / (size / 2));
            if (x - size / 2 < p1 * h)
                return realcolorH1;
            else if (x - (3 / 2 * size + h) > (1 - p1) * h)
                return realcolorH2;
        }
        else if (y < size / 2 + h) {
            const p2 = 1 - (y - size / 2) / h;
            if (x < p2 * size / 2 || x - (size * 3 / 2 + 2 * h) > (1 - p2) * size / 2)
                return colorT;
        }
        else if (y > 1.5 * size + h) {
            const p3 = (y - (1.5 * size + h)) / h;
            if (x < p3 * size / 2 || x - (size * 3 / 2 + 2 * h) > (1 - p3) * size / 2)
                return colorT;
        }
        return realcolorH3;
    };
}

/* Texture : small rhombitrihexagonal tiling
 *
 * @param dict.size     side size of squares, triangles and hexagons
 * @param dict.colors   square, triangle & hexagon colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (x,y) position 
 */
function texture_smallRhombitrihexagonalTiling(dict) {
    const size =    dict['size']    || 60;
    const colors =  dict['colors']  || [];
    const colorS =  dict['color1']  || colors[0] || COLORS.cyan;
    const colorT =  dict['color2']  || colors[1] || COLORS.orange;
    const colorH =  dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 2 * (h + size * 1.5), 0.5, h + size / 2);

        const [x, y] = ij2xy(i + offset, 2 * h + size, j, h + size * 1.5);
        // top 
        if (y < size / 2) {
            if (x > h && x < h + size)
                return colorS;
            else
                return colorH;
        }
        // middle
        else if (y < h + size) {
            // color triangle
            const p1 = (y < h + size / 2) ? (y - size / 2) / h % 1 : 1;
            const p2 = (y > size) ? 1 - ((y - size) / h % 1) : 1;
            if (x - h > p1 * size / 2 && x - h < (1 - p1 / 2) * size
                || x - (2 * h + size / 2) > p2 * size / 2 || x < (1 - p2) * size / 2)
                return colorT;
            // color hexagon 
            const p3 = (y < size) ? ((y - size / 2) / (size / 2)) % 1 : 1;
            const p4 = (y > h + size / 2) ? 1 - ((y - (h + size / 2)) / (size / 2)) % 1 : 1;
            if (x < (1 - p3) * h || x - (h + size) > p3 * h
                || x - size / 2 > p4 * h && x - size / 2 < (2 - p4) * h)
                return colorH;
            // color square
            else
                return colorS;
        }
        // bottom
        else
            if (x > size / 2 && x < 2 * h + size / 2)
                return colorH;
            else
                return colorS;
    };
}

/* Texture : big rhombitrihexagonal tiling
 *
 * @param dict.size     side size of squares, hexagons and dodecagons
 * @param dict.colors   square, hexagon & dodecagon colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (x,y) position 
 */
function texture_bigRhombitrihexagonalTiling(dict) {
    const size =    dict['size']    || 60;
    const colors =  dict['colors']  || [];
    const colorS =  dict['color1']  || colors[0] || COLORS.cyan;
    const colorH =  dict['color2']  || colors[1] || COLORS.orange;
    const colorD =  dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 2 * (h + size * 1.5), 0.5, size * 1.5 + 3 * h);

        const [x, y] = ij2xy(i + offset, 3 * size + 6 * h, j, h + size * 1.5);

        // top 
        if (y < size) {
            if (x < size)
                return colorS;
            else if (x < size + 2 * h || x >= 3 * size + 4 * h)
                return colorH;
            else
                return colorD;
        }
        // bottom
        else {
            const p1 = (y - size) / (size / 2);
            const p2 = (y - 3 / 2 * size) / h;
            const p3 = (y - (size + h)) / (size / 2);
            const p4 = (y - size) / h;
            if (x - size > p1 * h && x - (size + h) < (1 - p1) * h || x - (3 * size + 4 * h) > p1 * h && x - (3 * size + 5 * h) < (1 - p1) * h)
                return colorH;
            else if (x - (3 / 2 * size + h) > (1 - p3) * h && x - (3 / 2 * size + 2 * h) < p3 * h || x - (5 / 2 * size + 3 * h) > (1 - p3) * h && x - (5 / 2 * size + 4 * h) < p3 * h)
                return colorH;
            else if (x - (size + h) < p2 * size / 2 || x - (5 / 2 * size + 5 * h) > (1 - p2) * size / 2)
                return colorD;
            else if (x - (size + 2 * h) > p4 * size / 2 && x - (5 / 2 * size + 4 * h) < (1 - p4) * size / 2)
                return colorD;
            else
                return colorS;
        }
    };
}

/* Texture : snub hexagonal tiling
 *
 * @param dict.size     side size of triangles and hexagons
 * @param dict.colors   triangle & hexagon colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (x,y) position 
 */
function texture_snubHexagonal(dict) {
    const size =    dict['size']    || 60;
    const colors =  dict['colors']  || [];
    const colorH =  dict['color1']  || colors[0] || COLORS.cyan;
    const colorT1 = dict['color2']  || colors[1] || COLORS.orange;
    const colorT2 = dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = Math.floor(j / (3 * h)) * 6.5 * size;

        const [x, y] = ij2xy(i + offset, 7 * size, j, 3 * h);

        const p1 = y / h;
        const p2 = (y - h) / h;
        const p3 = (y - 2 * h) / h;

        if (x > (1 - p1) * size / 2 && x - 3 / 2 * size < p1 * size / 2 && x > p2 * size / 2 && x - 3 / 2 * size < (1 - p2) * size / 2 && y < 2 * h)
            return colorH;
        else if (x - 5 / 2 * size > (1 - p2) * size / 2 && x - 4 * size < p2 * size / 2 && x - 5 / 2 * size > p3 * size / 2 && x - 4 * size < (1 - p3) * size / 2 && y >= h)
            return colorH;
        else if (x - 5 * size > (1 - p3) * size / 2 && x - 6.5 * size < p3 * size / 2 && y >= 2 * h || x - 4.5 * size > p1 * size / 2 && x - 6 * size < (1 - p1) * size / 2 && y < h)
            return colorH;
        else
            return texture_triangleTiling({ size: size, colors: [colorT1, colorT2] })(x + size / 2, y);
    };
}

/* Texture : trihexagonal tiling
 *
 * @param dict.size     side size of hexagons and triangles
 * @param dict.colors   triangle & hexagon colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position
 */
function texture_trihexagonal(dict) {
    const size =    dict['size']    || 60;
    const colors =  dict['colors']  || [];
    const colorT =  dict['color1']  || colors[0] || texture_solid({ colors: [COLORS.cyan] });
    const colorH =  dict['color2']  || colors[1] || texture_solid({ colors: [COLORS.orange] });

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 4 * h, 0.5, size);

        const [x, y] = ij2xy(i + offset, 2 * size, j, h);

        const p = (j % (2 * h) > h) ? y / h : 1 - y / h;
        if (x > p * size / 2 && (i + offset) % (2 * size) < (2 - p / 2) * size)
            return colorH;
        else
            return colorT;
    };
}

//Exports
exports.elongatedTriangular             = texture_elongatedTriangular;
exports.snubSquare                      = texture_snubSquare;
exports.truncatedSquare                 = texture_truncatedSquare;
exports.truncatedHexagon                = texture_truncatedHexagon;
exports.smallRhombitrihexagonalTiling   = texture_smallRhombitrihexagonalTiling;
exports.bigRhombitrihexagonalTiling     = texture_bigRhombitrihexagonalTiling;
exports.snubHexagonal                   = texture_snubHexagonal;
exports.trihexagonal                    = texture_trihexagonal;