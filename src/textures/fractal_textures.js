'use strict';

// Global variables
const globalVars = require('../vars.js');
const COLORS = globalVars.COLORS;
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;

function texture_triangularFractal(dict) {
    const width_init =  dict['width']   || WIDTH;
    const height_init = dict['height']  || HEIGHT;
    const n =           dict['depth']   || 5;
    const colors =      dict['colors']  || [];
    const color1 =      dict['color1']  || colors[0] || COLORS.black;
    const color2 =      dict['color2']  || colors[1] || COLORS.white;

    return function (i, j) {
        function triangle(width, height, x_offset, y_offset) {
            const x = i - x_offset;
            const y = j - y_offset;
            const p1 = 1 - y / (height / 2);
            const p2 = 1 - (y - height / 2) / (height / 2);
            if (width < width_init / (2 ** (n - 1)) || height < height_init / (2 ** (n - 1)))
                return color1;
            else if (x - width / 4 >= p1 * width / 4 && x - width / 2 <= (1 - p1) * width / 4 && y <= height / 2)
                return triangle(width / 2, height / 2, x_offset + width / 4, y_offset);
            else if (x >= p2 * width / 4 && x - width / 4 <= (1 - p2) * width / 4 && y >= height / 2 && y <= height)
                return triangle(width / 2, height / 2, x_offset, y_offset + height / 2);
            else if (x - width / 2 >= p2 * width / 4 && x - 3 * width / 4 <= (1 - p2) * width / 4 && y >= height / 2 && y <= height)
                return triangle(width / 2, height / 2, x_offset + width / 2, y_offset + height / 2);
            else
                return color2;
            }
        return triangle(width_init, height_init, 0, 0);
    };
}

function texture_squareFractal(dict) {
   const width_init =   dict['width']   || WIDTH;
   const height_init =  dict['height']  || HEIGHT;
   const n =            dict['depth']   || 3;
   const colors =       dict['colors']  || [];
   const color1 =       dict['color1']  || colors[0] || COLORS.black;
   const color2 =       dict['color2']  || colors[1] || COLORS.white;

    return function(x, y) {
      
        function square(width, height, x_offset, y_offset, lvl) {

            let x_newoffset = x_offset;
            let y_newoffset = y_offset;
            let i = x - x_offset;
            let j = y - y_offset;
            let midx = false, midy = false;

            if(i < width/(3))            
                x_newoffset += 0;
            else if(i > (2*width)/(3))   
                x_newoffset += 2*(width/3);
            else {
                x_newoffset += width/3;
                midx = true;
            }                         

            if(j < height/(3))           
                y_newoffset += 0;
            else if(j > (2*height)/(3))  
                y_newoffset += 2*(height/3);
            else {
                y_newoffset += height/3;
                midy = true;
            }

            if(midx && midy) 
                return color2;
            else if(lvl > 0)
                return square(width/(3), height/(3), x_newoffset, y_newoffset, lvl-1);
            else 
                return color1;
        }
        return square(width_init, height_init, 0, 0, n-1);
   };

}

// Exports
exports.triangularFractal 	= texture_triangularFractal;
exports.squareFractal 		= texture_squareFractal;