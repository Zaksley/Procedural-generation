'use strict';

// Global variables
const globalVars = require('../vars.js');
const COLORS = globalVars.COLORS;
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;

const tools = require("./tools_for_textures.js");
const getRandomInt = tools.getRandomInt;
const getFourInterpolateCoordinates = tools.getFourInterpolateCoordinates;

/* Texture : PerlinNoise board
 *
 * @param row number of rows
 * @param column numbe of column
 * @param nb_colors number of color
 * @param colors list of all colors in a array
 * @param (i,j) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position   
 */
function texture_perlinNoise(dict) {

    const row = dict['rows'] 		|| 5;
    const column = dict['columns'] 	|| 5;
    const colors = dict['colors'] 	|| [COLORS.blue, COLORS.green, COLORS.red];

    /*
    row
    return function (column) {
        return function (nb_colors) {
            return function (colors) {
    */

    let stock_gradient = {};

    // =====================================================

    // Fade interpolation 
    function interpolate(smoothstep) {
        return (v0, v1, t) => (v1 - v0) * smoothstep(t) + v0;
    }

    const fade_Interpolation = interpolate(t => t * t * t * (10 - 15 * t + 6 * t * t));

    /*
    *   Create random direction vector 
    *   Used for the Grid 
    */
    function random_Vector() {
        const random = Math.random() * 2 * Math.PI;
        return [Math.cos(random), Math.sin(random)];
    }

    /*
    * Computes the dot product of the distance and gradient vectors
    */
    function dot_Product(vector, distance) {
        return (distance[0] * vector[0] + distance[1] * vector[1]);
    }

    function get_Dot(ix, iy, x_grid, y_grid) {
        // Get a vector
        if (!stock_gradient[[ix, iy]])
            stock_gradient[[ix, iy]] = random_Vector(ix, iy);

        // Calculate distance 
        const dx = x_grid - ix;
        const dy = y_grid - iy;

        return dot_Product(stock_gradient[[ix, iy]], [dx, dy]);
    }

    // Return a color depending of the value and the colors permited 
    function get_Colors(value) {
        return Math.floor(value / ([1, 2, 3, 4, 5].map((x) => 1 / x))[colors.length - 1]);
    }

    // =====================================================

    /*
    * Compute Perlin noise at coordinates x,y 
    */
    return (x, y) => {
        // Determine precise coordinates in the grid
        const x_grid = x / row;
        const y_grid = y / column;

        // Determine grid cell coordinates
        const x0 = Math.floor(x_grid);
        const x1 = x0 + 1;
        const y0 = Math.floor(y_grid);
        const y1 = y0 + 1;

        // Determine interpolation weights
        const distance = [x_grid - x0, y_grid - y0];

        // Interpolate between grid point gradients
        const Up_Left = get_Dot(x0, y0, x_grid, y_grid);
        const Up_Right = get_Dot(x1, y0, x_grid, y_grid);
        const Down_Left = get_Dot(x0, y1, x_grid, y_grid);
        const Down_Right = get_Dot(x1, y1, x_grid, y_grid);

        let value = fade_Interpolation(
            fade_Interpolation(Up_Left, Up_Right, distance[0]),
            fade_Interpolation(Down_Left, Down_Right, distance[0]),
            distance[1]
        );

        // Making value between 0 and 1
        value = (value + 1) / 2;
        return colors[get_Colors(value)];
    };
}





function texture_whiteNoise() {
   return function(x,y){
      void(x);
      void(y);
      return [getRandomInt(256),
      getRandomInt(256),
      getRandomInt(256),
      255];
   }
}


/* Texture : band-limited white noise
 *
 * @param dict.width    canvas width
 * @param dict.height   canvas height
 * @param dict.rows     rows    frequency
 * @param dict.columns  columns frequency
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_limitedWhiteNoise(dict) {

    const width = dict['width']     || WIDTH;
    const height = dict['height']   || HEIGHT;
    const rows = dict['rows']       || 5;
    const columns = dict['columns'] || 5;
    let pixels = [];
    
    for (let a = 0; a < width; a++) {
        pixels[a] = [];
        for (let b = 0; b < height; b++) {
            pixels[a][b] = [];
            if (a % rows === 0 && b % columns === 0) {
                pixels[a][b][0] = getRandomInt(256); // Red channel
                pixels[a][b][1] = getRandomInt(256); // Green channel
                pixels[a][b][2] = getRandomInt(256); // Blue channel
                pixels[a][b][3] = 255; // Alpha channel
            }
            else {
                pixels[a][b][0] = 255; // Red channel
                pixels[a][b][1] = 255; // Green channel
                pixels[a][b][2] = 255; // Blue channel
                pixels[a][b][3] = 255; // Alpha channel
            }
        }
    }

    return (x, y) => {
        if (x % rows === 0 && y % columns === 0) {
            return [pixels[x][y][0],
                    pixels[x][y][1],
                    pixels[x][y][2],
                    pixels[x][y][3]];
        }
        else {
            // full square case
            if (typeof (x) !== 'number' && typeof (y) !== 'number')
                return [255, 255, 255, 255];

            let [top, bottom, left, right] = getFourInterpolateCoordinates(rows, columns, x, y);

            let redVal = 0;
            let greVal = 0;
            let bluVal = 0;
            let alpVal = pixels[left][top][3];

            let neighboors = [];

            neighboors.push({ x: left, y: top, dist: Math.abs(x - left) + Math.abs(y - top) });

            if (right < width) {
                neighboors.push({ x: right, y: top, dist: Math.abs(x - right) + Math.abs(y - top) });
            }

            if (bottom < height) {
                neighboors.push({ x: left, y: bottom, dist: Math.abs(x - left) + Math.abs(y - bottom) });
            }

            if (bottom < height && right < width) {
                neighboors.push({ x: right, y: bottom, dist: Math.abs(x - right) + Math.abs(y - bottom) });
            }

            const distMax = neighboors.reduce((acc, el) => acc += el.dist, 0);
            neighboors.sort((el1, el2) => el1.dist - el2.dist);


            for (let k = 0; k < neighboors.length / 2; ++k) {
                let tmp = neighboors[k].dist;
                neighboors[k].dist = neighboors[neighboors.length - k - 1].dist;
                neighboors[neighboors.length - k - 1].dist = tmp;
            }

            neighboors.forEach(el => {
                redVal += pixels[el.x][el.y][0] * (el.dist) / distMax;
                greVal += pixels[el.x][el.y][1] * (el.dist) / distMax;
                bluVal += pixels[el.x][el.y][2] * (el.dist) / distMax;
            });

            return [redVal, greVal, bluVal, alpVal];

        }
    };
}

// Exports
exports.whiteNoise 			= texture_whiteNoise;
exports.limitedWhiteNoise 	= texture_limitedWhiteNoise;
exports.perlinNoise 		= texture_perlinNoise;