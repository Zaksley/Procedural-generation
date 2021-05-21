'use strict';

const globalVars = require('../vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;
//const COLORS = globalVars.COLORS;

/* Filter : Conform/Anticonform transformation
 *
 * @param function An conform or anticonform transformation function
 * @param width image full width
 * @param width2 pattern width
 * @param height pattern width
 * @param intensity function first parameter
 * @param intensity2 function second parameter
 * @param offsetx x_coordinate shift
 * @param offsety y_coordinate shift
 * @return the filtered image
 */
function filter_conformTransformation(dict) {
    const width =       dict['width']       || WIDTH;
    const width2 =      dict['width2']      || WIDTH;
    const height =      dict['height']      || HEIGHT;
    const fun =         dict['function']    || "x2";
    const intensity =   dict['intensity']   || 1;
    const intensity2 =  dict['intensity2']  || 1;
    const x_offset =    dict['offsetx']     || 0;
    const y_offset =    dict['offsety']     || 0;

    function shiftPos(e, max) {
        return Math.abs(e - max / 2) / max;
    }

    function toPolar(a, b) {
        return [Math.sqrt(a ** 2 + b ** 2), Math.atan(b / a)];
    }

    function toEuclid(r, th) {
        return [r * Math.cos(th), r * Math.cos(th)];
    }

    function getAntecedent(i, j) { // method="solid"
        if (i < x_offset || j < y_offset || i > x_offset + width2 || j > y_offset + height) {
            return (j * width + i) * 4;
        }
        let f = (e => e);
        let complex = 0;
        switch (fun) {
            case "sqrt": 
                f = ((x, y) => [
                    Math.floor(Math.sqrt(shiftPos(x, width)) * width),
                    Math.floor(Math.sqrt(shiftPos(y, height)) * height)
                ]); break;
            case "sqrt/2": 
                f = ((x, y) => [
                    Math.floor(Math.sqrt(shiftPos(x, width)) * width / 2),
                    Math.floor(Math.sqrt(shiftPos(y, height)) * height / 2)
                ]); break;
            case "x2": 
                f = ((x, y) => [
                    Math.floor(shiftPos(x, width) ** 2 * width),
                    Math.floor(shiftPos(y, height) ** 2 * height)
                ]); break;
            case "bendNorth": 
                f = ((x, y) => [
                    Math.floor((x - width2 / 2) / width2 * (height - y) * intensity2),
                    Math.floor((y / height) ** (0.4 / intensity) * height)
                ]); break;
            // Not working ----
            case "x22": 
                complex = toPolar(shiftPos(i, width), shiftPos(j, height));
                f = (() => toEuclid(
                    Math.floor(complex[0] ** 2),
                    Math.floor(complex[1] * 2)
                )); break;
            // ---------------
            case "tiltNorth":
                f = function (x, y) {
                    const x2 = x - x_offset; const y2 = y - y_offset;
                    return [
                        Math.floor((x2 + (height - (intensity2 * y2)) * (x2 - width2 / 2) / height)),
                        Math.floor((y2 / height) ** (1 / intensity) * height)
                    ];
                }; break;
            case "starSky": 
                f = ((x, y) => [
                    Math.floor((x * y) % width),
                    Math.floor((x * y) % height)
                ]); break;
            case "1/x": 
                f = ((x, y) => [
                    Math.floor(1 / (shiftPos(x, width))),
                    Math.floor(1 / (shiftPos(y, height)))
                ]); break;
            case "cos":
                f = ((x, y) => [
                    Math.floor(width / 2 * Math.abs(1 + Math.sin(Math.PI * x / width))),
                    Math.floor(height / 2 * Math.abs(1 + Math.sin(Math.PI * y / height)))
                ]); break;
            default: 
                f = ((x, y) => [x, y]); break;
        }
        const transfo = f(i, j);
        return ((transfo[1] * width) + transfo[0]) * 4;
    }

    //Todo blur masking with jacobian

    return function conformTransformation(img) {
        let data = img.slice();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                for (let k = 0; k < 3; k++) {
                    data[((y * width) + x) * 4 + k] = img[getAntecedent(x, y) + k];
                }
            }
        }
        return data;
    };
}

// Exports
exports.conformTransformation = filter_conformTransformation;