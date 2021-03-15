'use strict';

function solid(i, j)
{
    return [0, 0, 0, 255]; 
};

function gradient_Horizontal(i, j)
{
    return [Math.floor(255*j/height), Math.floor(255*j/height), Math.floor(255*j/height), 255];
};

function gradient_Vertical(i, j)
{
    return [Math.floor(255*i/width), Math.floor(255*i/width), Math.floor(255*i/width), 255];
};


function regulatePavage_square(i, j, nbSquare_x, nbSquare_y)
{
    let sizeSquare_x = width/nbSquare_x; 
    let sizeSquare_y = height/nbSquare_y;

    let coordinate_x = Math.floor(i/sizeSquare_x);
    let coordinate_y = Math.floor(j/sizeSquare_y);

    if (coordinate_x % 2 == 0 && coordinate_y  % 2 != 0)   return [255, 255, 255, 255]; 
    if (coordinate_x % 2 != 0 && coordinate_y  % 2 == 0)   return [255, 255, 255, 255]; 

    return [0, 0, 0, 255]; 
};

/* Texture : multiple horizontal black-to-white gradients
 *
 * @param width canvas width
 * @param n number of repetitions
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_multiHorizGrad(width){
    return function (n) { 
    return function (x,y) {
        return [Math.floor(255*((n*x)%width)/width),
                Math.floor(255*((n*x)%width)/width),
                Math.floor(255*((n*x)%width)/width), 
                255];
    }; };
};

/* Texture : multiple horizontal color1-to-color2 gradients
 * 
 * @param width canvas width
 * @param n number of repetitions
 * @param color1 starting color (rgba 4-upple format)
 * @param color2 ending color (rgba 4-upple format)
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_multiHorizColorGrad(width){
    return function (n) {
    return function (color1) {
    return function (color2) {
    return function (x,y) {
        return [0,0,0,0].map((e,i) => 
            Math.floor(color1[i]*((n*(width-x))%width)/width + color2[i]*((n*x)%width)/width));
    }; }; }; };
};

/* Texture : paving of color1 and color2 triangles
 *
 * @param size side size of triangles
 * @param color1 first color of the paving (rgba 4-upple format)
 * @param color2 second color of the paving (rgba 4-upple format)
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position   
*/
function triangle(size){
    return function (color1) {
    return function (color2) {
    return function (i, j) {   
	const h = Math.sqrt(3)*size/2;
	const p = j/h%1;
	const offset = Math.floor(j/h)%2*size/2;
	if ((i+offset)%size > p*size/2 && (i+offset)%size < (1-p/2)*size)
	    return color1;
	else
	    return color2;
    }; }; };
};

/* Texture : paving of color1, color2 and color3 hexagons
 *
 * @param size side size of hexagons
 * @param color1 first color of the paving (rgba 4-upple format)
 * @param color2 second color of the paving (rgba 4-upple format)
 * @param color3 third color of the paving (rgba 4-upple format)
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position   
*/
function hexagon(size){
    return function (color1) {
    return function (color2) {
    return function (color3) {
    return function (i, j) {
	const h = Math.sqrt(3)*size/2;
	let p = j/h%1;
	if (j%(2*h) > h)
	    p = 1-p;
	if (i%(3*size) > p*size/2 && i%(3*size) < (2-p/2)*size) {	
	    if ((j+h)%(6*h) < 2*h)
		return color1;
	    else if ((j+h)%(6*h) < 4*h)
		return color2;
	    else
		return color3;
	} else {
	    if (j%(6*h) < 2*h)
		return color3;
	    else if (j%(6*h) < 4*h)
		return color1;
	    else
		return color2;
	}
    }; }; }; };
};

/* Texture : checkerboard of color1 and color2 rectangles
 *
 * @param width canvas width
 * @param height canvas height
 * @param row number of rows
 * @param column numbe of column
 * @param color1 first color of the paving (rgba 4-upple format)
 * @param color2 second color of the paving (rgba 4-upple format)
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position   
*/
function chess(width){
    return function (height) {
    return function(row) {
    return function(column) {
    return function(color1) {
    return function(color2) {
    return function(x, y) {
    const size_x = width/column;
    const size_y = height/row;
    if (y%(2*size_y) < size_y) {
	if (x%(2*size_x) < size_x)
	    return color1;
	else
	    return color2;
    } else {
	if (x%(2*size_x) < size_x)
	    return color2;
	else
	    return color1;
    }; }; }; }; }; }; };
};
