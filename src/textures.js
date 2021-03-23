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

/* Texture :
 *
 *
 */
function texture_truncatedSquare(size) {
    return function (colorS) {
    return function (colorH1) {
    return function (colorH2) {
    return function (i, j) {
	const h = Math.sqrt(2)*size/2;
	const p = j%(h + size) > h ? 1 : j%(h+size)/h;
	const offset = j%(2*(h + size)) > h + size ? 0 : h+size;
	if ((i+offset)%(2*(h+size)) > h && (i+offset)%(2*(h+size)) < h + size && j%(h + size) > h)
	    return colorS;
	if ((i+offset)%(2*(h+size)) > p*h && (i+offset)%(2*(h+size)) < (2-p)*h + size)
	    return j%(2*(h + size)) > h + size ? colorH1 : colorH2;
	else
	    return j%(2*(h + size)) > h + size ? colorH2 : colorH1;
    }; }; }; };
};

/* Texture :
 *
 *
 */
function texture_trihexagonal(size) {
    return function (colorT) {
    return function (colorH) {
    return function (i, j) {
	const h = Math.sqrt(3)*size/2;
	const p = j%(2*h) > h ? j/h%1 : 1 - j/h%1;
	const offset = j%(4*h) > 2*h ? 0: size;
	if ((i+offset)%(2*size) > p*size/2 && (i+offset)%(2*size) < (2-p/2)*size)	
	    return colorH((i+offset)%(2*size), j%h);
	else
	    return colorT((i+offset+size/2)%(2*size), j%h);
    }; }; };
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
    return function (row) {
    return function (column) {
    return function (color1) {
    return function (color2) {
    return function (x, y) {
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

/* Texture : PerlinNoise board
 *
 * @param row number of rows
 * @param column numbe of column
 * @param nb_colors number of color
 * @param colors list of all colors in a array
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position   
 */
function texture_perlinNoise(row){
    return function (column) {
    return function (nb_colors) {
    return function (colors) {

        let stock_gradient = {}; 

         // =====================================================

            // Fade interpolation 
        function interpolate(smoothstep) {
            return (v0, v1, t) => (v1 - v0) * smoothstep(t) + v0; 
        }

        const fade_Interpolation = interpolate(t => t*t*t*(10 - 15*t + 6*t*t)); 

        /*
        *   Create random direction vector 
        *   Used for the Grid 
        */
        function random_Vector()
        {
            const random = Math.random() * 2 * Math.PI; 
            return [Math.cos(random), Math.sin(random)]; 
        }

        /*
        * Computes the dot product of the distance and gradient vectors
        */
        function dot_Product(vector, distance) 
        {
            return (distance[0] * vector[0] + distance[1] * vector[1]); 
        }

        function get_Dot(ix, iy, x_grid, y_grid)
        {
                // Get a vector
            if (!stock_gradient[[ix,iy]]) 
                stock_gradient[[ix, iy]] = random_Vector(ix, iy);

                // Calculate distance 
            const dx = x_grid - ix;
            const dy = y_grid - iy; 

            return dot_Product(stock_gradient[[ix, iy]], [dx, dy]);
        }

            // Return a color depending of the value and the colors permited 
        function get_Colors(nb_colors, value)
        {
            return Math.floor(value / ( [1, 2, 3, 4, 5].map( (x) => 1/x) )[nb_colors-1]); 
        }   

        // =====================================================
        
        /*
        * Compute Perlin noise at coordinates x,y 
        */
        return (x, y) => {
                // Determine precise coordinates in the grid
            const x_grid = x/row;
            const y_grid = y/column; 

                // Determine grid cell coordinates
            const x0 = Math.floor(x_grid); 
            const x1 = x0 + 1;
            const y0 = Math.floor(y_grid); 
            const y1 = y0 + 1;

                // Determine interpolation weights
            const distance = [x_grid-x0, y_grid-y0]; 

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
            value = (value + 1)/2;
            return colors[get_Colors(nb_colors, value)];
        }
    }; }; };
}



function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function texture_whiteNoise()
{
    return (x,y) => [getRandomInt(256),
                     getRandomInt(256),
                     getRandomInt(256),
                     255];
}

function getTwoInterpolateIndices(i, n)
{
    let before = n - i + 1;
    let after  = n + i - 1;
    while (before % i != 0) before++;
    while (after % i  != 0) after--;

    return [before, after];
}

function getFourInterpolateCoordinates(i, j, x, y)
{
    let left = y - j + 1;
    let right  = y + j - 1;
    let top = x - i + 1;
    let bottom = x + i - 1;
    
    while (top % i != 0) top++;
    while (bottom % i != 0) bottom--;
    while (left % j != 0) left++;
    while (right % j != 0) right--;
    
    return [top, bottom, left, right];
}


/* Texture : band-limited white noise
 *
 * @param width  canvas width
 * @param height canvas height
 * @param i number of lines skipped
 * @param j number of columns skipped
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_limitedWhiteNoise(width)
{
    return (height) => (i) => (j) => {
        let pixels = [];
        for (let x = 0; x < width; x++) {
            pixels[x] = [];
	    for (let y = 0; y < height; y++) {
                pixels[x][y] = [];
                if (x % i === 0 && y % j === 0)
                {
	            pixels[x][y][0] = getRandomInt(256); // Red channel
	            pixels[x][y][1] = getRandomInt(256); // Green channel
	            pixels[x][y][2] = getRandomInt(256); // Blue channel
	            pixels[x][y][3] = 255; // Alpha channel
                }
                else
                {
                    pixels[x][y][0] = 255; // Red channel
	            pixels[x][y][1] = 255; // Green channel
	            pixels[x][y][2] = 255; // Blue channel
	            pixels[x][y][3] = 255; // Alpha channel
                }
	    };
        };

        return (x,y) => {
            if (x % i === 0 && y % j === 0)
            {
                return [pixels[x][y][0],
                        pixels[x][y][1],
                        pixels[x][y][2],
                        pixels[x][y][3]];
            }
            else
            {
                if ( x % i === 0 && y % j != 0) // top - bottom case
                {
                    let [top, bottom] = getTwoInterpolateIndices(j, y);

                    let redVal = pixels[x][top][0];
                    let greVal = pixels[x][top][1];
                    let bluVal = pixels[x][top][2];
                    let alpVal = pixels[x][top][3];
                    
                    if (bottom < height)
                    {
                        redVal = Math.floor((pixels[x][top][0] + pixels[x][bottom][0]) / 2);
                        greVal = Math.floor((pixels[x][top][1] + pixels[x][bottom][1]) / 2);
                        bluVal = Math.floor((pixels[x][top][2] + pixels[x][bottom][2]) / 2);
                        alpVal = Math.floor((pixels[x][top][3] + pixels[x][bottom][3]) / 2);
                    }

                    return [redVal, greVal, bluVal, alpVal];
                }

                if ( x % i != 0 && y % j === 0) // left - right case
                {
                    let [left, right] = getTwoInterpolateIndices(i, x);
                    
                    let redVal = pixels[left][y][0];
                    let greVal = pixels[left][y][1];
                    let bluVal = pixels[left][y][2];
                    let alpVal = pixels[left][y][3];
                   
                    if (right < width)
                    {
                        redVal = Math.floor((pixels[left][y][0] + pixels[right][y][0]) / 2);
                        greVal = Math.floor((pixels[left][y][1] + pixels[right][y][1]) / 2);
                        bluVal = Math.floor((pixels[left][y][2] + pixels[right][y][2]) / 2);
                        alpVal = Math.floor((pixels[left][y][3] + pixels[right][y][3]) / 2);
                    }

                    return [redVal, greVal, bluVal, alpVal];
                }

                // full square case
                // /!\ Seems to broke the code /!\
                
                //let [t, b, l, r] = getFourInterpolateCoordinates(i, j, x, y);
                
                // let redVal = pixels[left][top][0];
                // let greVal = pixels[left][top][1];
                // let bluVal = pixels[left][top][2];
                // let alpVal = pixels[left][top][3];
                // let numberNeighboor = 1;
                
                // if (right < width)
                // {
                //     redVal += pixels[right][top][0];
                //     greVal += pixels[right][top][1];
                //     bluVal += pixels[right][top][2];
                //     alpVal += pixels[right][top][3];
                //     numberNeighboor++;
                // }

                // if (bottom < height)
                // {
                //     redVal += pixels[left][bottom][0];
                //     greVal += pixels[left][bottom][1];
                //     bluVal += pixels[left][bottom][2];
                //     alpVal += pixels[left][bottom][3];
                //     numberNeighboor++;
                // }

                // if (bottom < height && right < width)
                // {
                //     redVal += pixels[right][bottom][0];
                //     greVal += pixels[right][bottom][1];
                //     bluVal += pixels[right][bottom][2];
                //     alpVal += pixels[right][bottom][3];
                //     numberNeighboor++;
                // }

                // redVal = Math.floor(redVal / numberNeighboor);
                // greVal = Math.floor(greVal / numberNeighboor);
                // bluVal = Math.floor(bluVal / numberNeighboor);
                // alpVal = Math.floor(alpVal / numberNeighboor);
                // return [redVal, greVal, bluVal, alpVal];
                return [255, 255, 255, 255];
            }  
        }
    }
}


/* Texture : Voroinoï diagram 
 *
 * @param nb_case  Number of germs in Voronoï diagram
 * @param height canvas height
 * @param i number of lines skipped
 * @param j number of columns skipped
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_Voronoi(nb_case) {
    return function (width) {
    return function (height) {

    let count = 0; 
    let stock_germs = {}; 
    for (let i=0; i<nb_case; i++){
        stock_germs[i] = [getRandomInt(width), getRandomInt(height)];  
    }
    
    // TODO Mettre fonctionnel
    // Return indice of the minest one (min[0]) and the second minest one (min[1])
    function get_two_closest(x, y) {
        let min = [0, 0]; 
        let gx = 0;
        let gy = 0;
        count += 1; 
        for (let i=1; i<nb_case; i++)
        {

            gx = stock_germs[i][0];
            gy = stock_germs[i][1]; 

                // Distance smaller than min[0]
            if ( distance (x, y, stock_germs[min[0]][0],stock_germs[min[0]][1] )  >= distance(x, y, gx, gy) )
            {
                min[1] = min[0]; 
                min[0] = i; 

            }
            else if ( distance(x, y, stock_germs[min[1]][0],stock_germs[min[1]][1]) > distance(x, y, gx, gy))
            {
                min[1] = i; 
            }
        }

        return min; 
    }
    

    function distance(x, y, gx, gy)
    {
        return Math.sqrt( (gx-x)**2 + (gy - y)**2 ); 
    }

    function smoothstep(x, y, epsilon)
    {
        if ( Math.abs(Math.floor(x) - Math.floor(y)) < epsilon)
            return true;
        return false; 
    }

        // Voronoï calcul for (x, y) coordinate 
    return (x, y) => {
        let min = get_two_closest(x, y); 

        let gx_1 = stock_germs[min[0]][0];
        let gy_1 = stock_germs[min[0]][1]; 
        let dist_1 = distance(x, y, gx_1, gy_1); 

        let gx_2 = stock_germs[min[1]][0];
        let gy_2 = stock_germs[min[1]][1]; 
        let dist_2 = distance(x, y, gx_2, gy_2); 

                    /*
        if (x === 50 && y === 95)
        {   
            console.log(dist_1); 
            console.log(dist_2);
            console.log(stock_germs[min[0]]);
            console.log(stock_germs[min[1]]); 
            return colors.white;
        }
                    */
                    
                

            // It's a GERM 
        let r = 4; 
        if (dist_1 <= r ) return colors.blue; 
        
        else if (smoothstep(dist_1, dist_2, 2))
        {
            return colors.black;    
        }
        else return colors.red; 
    }

    }   };  
}
