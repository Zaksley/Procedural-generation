'use strict';

// Global variables
const globalVars = require('../vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;

/* Translates coordinates to match a canvas
 *
 * @param i x-coordinate of a pixel
 * @param j y-coordinate of a pixel
 * @param width width of the canvas
 * @param height height of the canvas
 * @return (i,j) translated in ([0,width],[0, height])
 */
function ij2xy(i, width, j, height) {
    let x = i;
    let y = j;
    while (x < 0) {
        x += width;
    }
    while (y < 0) {
        y += height;
    }
    return [x % width, y % height];
}

/* Gets an offset for a shape
 *
 */
function get_offset(coord, freq, percent, offset) {
    if (coord < 0)
        return ((-coord / freq) % 1 < percent) ? offset : 0;
    return ((coord / freq) % 1 < percent) ? 0 : offset;
}

/* Generates a random int 
 *
 * @param max upper boundary of the maximum
 * @return a random int between 0 and max
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

// Used in limitedWhiteNoise
function getFourInterpolateCoordinates(i, j, x, y) {
    let top = y - j + 1;
    let bottom = y + j - 1;
    let left = x - i + 1;
    let right = x + i - 1;

    while (top % j !== 0) top++;
    while (bottom % j !== 0) bottom--;
    while (left % i !== 0) left++;
    while (right % i !== 0) right--;

    return [top, bottom, left, right];
}

/* Function : is in shape
 * if not working properly try to split your shape into two
 *
 * @param coords array of points' coordonates in clockwise order
 * @param (x, y) coordinates of the pixel
 * @return a boolean corresponding to the belonging to the shape
 */
function isInShape(coords) {
    if (coords.length < 3)
        return (() => false);
    if (!isClockwise(coords))
        coords.reverse();
    let nbShapes = -1;
    let shapes = [];
    let [coords_prime, index_list] = [];
    while (shapes.length !== nbShapes) {
        nbShapes = shapes.length;
        [coords_prime, index_list] = removeInflexionPoint(coords);
        shapes = shapes.concat(shapeRemoveList(coords, index_list));
        coords = coords_prime;
    }

    /* Function : remove points that make the shape concave
     * 
     * @param array an array of coordinates
     * @return an array of coordinates
     */
    function removeInflexionPoint(array) {
        const N = array.length;
        let a = array[N - 1];
        let b = array[0];
        let c = array[1];
        const result = [];
        const index_inf = [];
        for(let i = 0; i < N; i++) {
            const p = (a[1] - b[1]) / (c[1] - b[1]);
            if (b[1] > c[1] && a[0] - b[0] >= p * (c[0] - b[0]) || !(b[1] > c[1]) && a[0] - b[0] <= p * (c[0] - b[0]))
                result.push(b);
            else
                index_inf.push(i);
            a = b;
            b = c;
            c = array[(i + 2) % N];
        }   
        return [result, index_inf];
    }

    /* Function is clockwise
     * 
     * @param array an array of coordinates
     * @return a boolean according to the "orientation" of points
     */
    function isClockwise(array) {
        const N = array.length;
        let min = 0;
        for(let k = 1; k < N; k++) {
            if (array[k][0] < array[min][0] || array[k][0] === array[min][0] && array[k][1] < array[min][1])
                min = k;
        }
        const p1 = (array[(min + 1) % N][1] - array[min][1]) / (array[(min + 1) % N][0] - array[min][0]);
        const p2 = (array[(N + min - 1) % N][1] - array[min][1]) / (array[(N + min - 1) % N][0] - array[min][0]);
        if (p1 < p2)
            return true;
        else 
            return false;
    }
    
    /* Function shapes that should be remove
     * 
     * @param array an array of coordinates
     * @param index an array of indexes
     * @return a list of shapes
     */
    function shapeRemoveList(array, index) {
        const shapeList = [];
        const N = array.length;
        const N_ind = index.length;
        for(let n = 0, nbPoints; n < N_ind; n += nbPoints) {
            const ind = index[n];
            const shapeToRemove = [array[(N + ind - 1) % N], array[ind], array[(ind + 1) % N]];
            for(nbPoints = 1; index[(n + nbPoints) % N_ind] === (ind + nbPoints) % N; nbPoints++)
                shapeToRemove.push(array[(ind + 1 + nbPoints) % N]);
            shapeList.push(shapeToRemove.reverse());
        }
        return shapeList;
    }

    /* Function : is in convex shape
        *
        * @param array an array of coordinates
        * @param (x, y) coordinates of the pixel
        * @return a boolean telling if the pixel is in the shape
        */
    function convex(array, x, y) {
        const N = array.length;
        function convexREC(n) {
            if (n === N)
                return true;
            const p = (y - array[n][1]) / (array[(n + 1) % N][1] - array[n][1]);
            if (array[n][1] > array[(n + 1) % N][1]) {
                if (x - array[n][0] >= p * (array[(n + 1) % N][0] - array[n][0]))
                    return convexREC(n + 1);
                else 
                    return false;
            }   
            else if (x - array[n][0] <= p * (array[(n + 1) % N][0] - array[n][0]))
                return convexREC(n + 1);
            else 
                return false;
        }
        return convexREC(0);
    }
    
    /* Function : remove concave part of the shape
    * 
    * @param shapeList an array of shapes
    * @param (x, y) coordinates of the pixel
    * @return a boolean telling if the pixel is NOT in one of the concave part
    */
    function removeConcave(shapeList, x, y) {
        const N = shapeList.length;
        function removeConcaveREC(n) {
            if (n === N)
                return true;
            else if (!convex(shapeList[n], x, y))
                return removeConcaveREC(n + 1);
            else    
                return false;
        }
        return removeConcaveREC(0);
    }

    /* Function test shape, compute tests that determine the belonging to the shape
     *
     * @param (x, y) coordinates of the pixel
     * @return a boolean corresponding to the belonging to the shape
     */
    return function testShape(x, y) {
        if (convex(coords_prime, x, y) && removeConcave(shapes, x, y))
            return true;
        else
            return false;
    };
}

function randomPolygon(n) {
    let polygon = [];
    for(let i = 0; i < n; i++) {
        polygon[i] = [getRandomInt(WIDTH), getRandomInt(HEIGHT)];
    }
    return polygon;
}

// Exports
exports.ij2xy 			= ij2xy;
exports.get_offset  	= get_offset;
exports.getRandomInt	= getRandomInt;
exports.getFourInterpolateCoordinates = getFourInterpolateCoordinates;
exports.isInShape       = isInShape;
exports.randomPolygon   = randomPolygon;