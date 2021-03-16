'use strict';

/* Texture : full black square
 * 
 * @param (x,y) coordinates of the pixel
 * @return a black pixel
 */
function solid(x,y){
    return [0, 0, 0, 255]; 
};

/* Texture : multiple horizontal black-to-white gradients
 *
 * @param width canvas width
 * @param n number of repetitions
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_horizontalGradients(width){
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
function texture_horizontalColorGradients(width){
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
function texture_triangleTiling(size){
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
function texture_hexagonTiling(size){
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
function texture_squareTiling(width){
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



/* Texture : PerlinNoise board of color1 and color2 pixels
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
function texture_perlinNoise(width){
    return function (height) { 
    return function (row) {
    return function (column) {
    return function (color1) {
    return function (color2) {
    return function (x, y) { 

        const size_square_x = width/column; 
        const size_square_y = height/row; 

        function interpolate(v0, v1, w) {
            return (v1 - v0) * w + v0;
        }

        /*
        *   Create random direction vector 
        *   Used for the Grid 
        */
        function randomGradient()
        {
            let vector_x = Math.random(); 
            let vector_y = Math.random(); 
            let norme = Math.sqrt(vector_x**2 + vector_y**2); 

            return [vector_x / norme, vector_y / norme]; 
        }

        /*
        * Computes the dot product of the distance and gradient vectors
        */
        function dotGridGradient(ix, iy, x_grid, y_grid) 
        {
                // Get vector from integers values
            var vector = randomGradient(ix, iy); 

                // Compute distance vector 
            let dx = x_grid - ix;
            let dy = y_grid - iy; 

                // Compute dot-product  
            return (dx * vector[0] + dy * vector[1]); 
        }

        /*
        * Compute Perlin noise at coordinates x,y 
        */
        function perlin(x, y) {

            let x_grid = x/row;
            let y_grid = y/column; 

                // Determine grid cell coordinates
            let x0 = Math.floor(x_grid); 
            let x1 = x0 + 1;
            let y0 = Math.floor(y_grid); 
            let y1 = y0 + 1;

                // Determine interpolation weights
            let sx = x_grid - x0; 
            let sy = y_grid - y0; 

                 // Interpolate between grid point gradients
            let n0 = dotGridGradient(x0, y0, x_grid, y_grid);
            let n1 = dotGridGradient(x1, y0, x_grid, y_grid);
            let ix0 =  interpolate(n0, n1, sx); 

            n0 = dotGridGradient(x0, y1, x_grid, y_grid);
            n1 = dotGridGradient(x1, y1, x_grid, y_grid);
            let ix1 = interpolate(n0, n1, sx);

            let value = interpolate(ix0, ix1, sy);
                // Making value between 0 and 1
            value = (value + 1)/2;

            if (value < 0.5) return color1;
            else return color2;  
        }

    return perlin(x, y);
    }; }; }; }; }; }; 
}
