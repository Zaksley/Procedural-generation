'use strict';

// Global Variables
const globalVars = require('../vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;
const COLORS = globalVars.COLORS;

/* Texture : transparent image
 *
 * @return a transparent pixel
 */
function texture_none() {
   return function () {
      return [0, 0, 0, 0];
   };
}

/* Texture : colored image
 * 
 * @param dict.colors    the color to fill (1-element array)
 * @param (x,y)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a black pixel
 */
function texture_solid(dict) {

   const colors = dict['colors'] || [];
   const color =  dict['color1'] || colors[0] || COLORS.cyan;

   return function () {
      return color;
   };
}

/* Texture : multiple horizontal color1-to-color2 gradients
 * 
 * @param dict.width    canvas width
 * @param dict.colors   starting and ending colors (2-element array)
 * @param dict.n        number of repetitions (vertical lines)
 * @param (x,y)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (x,y) position
 */
// updated
function texture_horizontalGradient(dict) {

   let width =       dict['width']     || WIDTH;
   const height =    dict['height']    || HEIGHT;
   const x_offset =  dict['offsetx']   || 0;
   const n =         dict['columns']   || 3;
   const a =         dict['angle']     || 0;
   const colors =    dict['colors']    || [];
   const color1 =    dict['color1']    || colors[0] || COLORS.blue;
   const color2 =    dict['color2']    || colors[1] || COLORS.cyan;

   return function (x, y) {
      function mod(n, m) {
         let r = n % m;
         return ((r >= 0) ? r : mod(r + m, m));
      }

      const ap = mod(a, 360);
      const th = 2 * Math.PI * ap / 360;
      width = (width < height) ? height : width;
      const length = (ap % 90 === 0) ? width : Math.sqrt(width ** 2 + height ** 2);
      let pos = (Math.cos(th) * (x - x_offset) - Math.sin(th) * (y - x_offset - width));
      if (ap >= 180) {
         if (ap >= 270)
            pos = pos - width * Math.sin(th);
         else
            pos = pos - width * (Math.cos(th) + Math.sin(th));
      } else {
         if (ap >= 90) {
            pos = pos - width * Math.cos(th);
         }
      }

      return [0, 0, 0, 0].map((e, i) => Math.floor(
         color1[i] * ((n * (length - pos - 1)) % (length + 1)) / (length - 1)
         + color2[i] * ((n * pos) % (length + 1)) / (length - 1)
      ));
   };
}

function texture_tileBoard(dict) {
   const width =  dict['width']     || WIDTH;
   const height = dict['height']    || HEIGHT;
   const th =     dict['size']      || 5;
   const r =      dict['rows']      || 3;
   const c =      dict['columns']   || 3;
   const colors = dict['colors']    || [];
   const color1 = dict['color1']    || colors[0] || COLORS.black;
   const color2 = dict['color2']    || colors[1] || COLORS.white;

   return function (x, y) {
      x = x % (width / c);
      y = y % (height / r);
      if (x < th / 2 || x > width / c - th / 2)
         return color2;
      else if (y < th / 2 || y > height / r - th / 2)
         return color2;
      else
         return color1;
   };
}

// Exports
exports.none               = texture_none;
exports.solid              = texture_solid;
exports.horizontalGradient = texture_horizontalGradient;
exports.tileBoard          = texture_tileBoard;
