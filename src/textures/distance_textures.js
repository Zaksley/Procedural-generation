'use strict';

// Global variables
const globalVars = require('../vars.js');
const COLORS = globalVars.COLORS;
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;

const tools = require("./tools_for_textures.js");
const ij2xy = tools.ij2xy;
const get_offset = tools.get_offset;

function colorFromDist(color, dist, size, func) {
    return func([color[0], color[1], color[2], color[3]], dist, size);
}

function distTexture_triangleTiling(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;
    const func = dict['function']   || ((array, dist, size) => [array[0], array[1], array[2], array[3] * dist / size]);
    
    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;

        const offset = get_offset(j, 2 * h, 0.5, size / 2);

        const [x, y] = ij2xy((i + offset), size, j, h);
        const p = y / h;

        const dist1 = Math.abs(x - p * size / 2);
        const dist2 = Math.abs(x - (2 - p) * size / 2);
        const dist3 = y > h / 2 ? h - y : y;
        const dist = Math.min(dist1, dist2, dist3);

        const realcolor1 = colorFromDist(color1, dist, h * 1 / 3, func);
        const realcolor2 = colorFromDist(color2, dist, h * 1 / 3, func);
        if (x > p * size / 2 && x - size / 2 < (1 - p) * size / 2)
            return realcolor1;
        else
            return realcolor2;
    };
}

function distTexture_hexagonTiling(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.cyan;
    const color2 = dict['color2']   || colors[1] || COLORS.orange;
    const color3 = dict['color3']   || colors[2] || COLORS.blue;
    const func = dict['function']   || ((array, dist, size) => [array[0], array[1], array[2], array[3] * dist / size]);

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;

        const offset = get_offset(i, 3 * size, 0.5, h);
        const [x, y] = ij2xy(i, 3 * size / 2, (j + offset), 2 * h);

        const cond1 = (j + 3 * offset) % (6 * h) > 2 * h;
        const cond2 = (j + 3 * offset) % (6 * h) > 4 * h;

        const p1 = 1 - y / h;
        const p2 = (y - h) / h;

        const dist1 = Math.abs(x - p1 * size / 2);
        const dist2 = Math.abs(x - p2 * size / 2);
        const dist3 = Math.abs(x - 3 * size / 2 - (1 - p1) * size / 2);
        const dist4 = Math.abs(x - 3 * size / 2 - (1 - p2) * size / 2);
        const dist5 = x > size / 2 ? y > h ? 2 * h - y : y : h;
        const dist = Math.min(dist1, dist2, dist3, dist4, dist5);

        const realcolor1 = colorFromDist(cond1 ? cond2 ? color3 : color2 : color1, dist, h / 2, func);
        const realcolor2 = colorFromDist(cond1 ? cond2 ? color1 : color3 : color2, dist, h / 2, func);
        const realcolor3 = colorFromDist(cond1 ? cond2 ? color2 : color1 : color3, dist, h / 2, func);

        if (x > p1 * size / 2 && x > p2 * size / 2)
            return realcolor1;
        else if (y < h)
            return realcolor2;
        else
            return realcolor3;
    };
}

function distTexture_squareTiling(dict) {

    const width = dict['width']     || WIDTH;
    const height = dict['height']   || HEIGHT;
    const rows = dict['rows']       || 5;
    const columns = dict['columns'] || 5;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.cyan;
    const color2 = dict['color2']   || colors[1] || COLORS.orange;
    const func = dict['function']   || ((array, dist, size) => [array[0], array[1], array[2], array[3] * dist / size]);

    return function (i, j) {
        const size_x = width / columns;
        const size_y = height / rows;

        const [x, y] = ij2xy(i, 2 * size_x, j, 2 * size_y);

        const dist1 = Math.abs(x);
        const dist2 = Math.abs(x - size_x);
        const dist3 = Math.abs(x - 2 * size_x);
        const dist4 = Math.abs(y);
        const dist5 = Math.abs(y - size_y);
        const dist6 = Math.abs(y - 2 * size_y);
        const dist = Math.min(dist1, dist2, dist3, dist4, dist5, dist6);

        const realcolor1 = colorFromDist(color1, dist, Math.min(size_x, size_y) / 2, func);
        const realcolor2 = colorFromDist(color2, dist, Math.min(size_x, size_y) / 2, func);

        if (y < size_y) {
            if (x < size_x)
                return realcolor1;
            else
                return realcolor2;
        } else {
            if (x < size_x)
                return realcolor2;
            else
                return realcolor1;
        }
    };
}

// Exports
exports.squareTilingDistance 	= distTexture_squareTiling;
exports.hexagonTilingDistance 	= distTexture_hexagonTiling;
exports.triangleTilingDistance 	= distTexture_triangleTiling;