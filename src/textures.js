'use strict';

function ij2xy(i, width, j, height) {
    return [i % width, j % height];
}

function get_offset(coord, freq, percent, offset) {
    return (coord / freq) % 1 < percent ? 0 : offset;
}

/* Texture : full black square
 * 
 * @param (x,y) coordinates of the pixel
 * @return a black pixel
 */
function solid(color){
    return function(x, y) {
	return color;
    };
}

/* Texture : multiple horizontal black-to-white gradients
 *
 * @param width canvas width
 * @param n number of repetitions
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_horizontalGradients(width) {
    return function (n) {
        return function (x, y) {
            return [Math.floor(255 * ((n * x) % width) / width),
            Math.floor(255 * ((n * x) % width) / width),
            Math.floor(255 * ((n * x) % width) / width),
                255];
        };
    };
}

/* Texture : multiple horizontal color1-to-color2 gradients
 * 
 * @param width canvas width
 * @param n number of repetitions
 * @param color1 starting color (rgba 4-upple format)
 * @param color2 ending color (rgba 4-upple format)
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_horizontalColorGradients(width) {
    return function (n) {
        return function (color1) {
            return function (color2) {
                return function (x, y) {
                    return [0, 0, 0, 0].map((e, i) =>
                        Math.floor(color1[i] * ((n * (width - x)) % width) / width + color2[i] * ((n * x) % width) / width));
                };
            };
        };
    };
}

/* Texture : paving of color1 and color2 triangles
 *
 * @param size side size of triangles
 * @param color1 first color of the paving (rgba 4-upple format)
 * @param color2 second color of the paving (rgba 4-upple format)
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position   
*/
function texture_triangleTiling(size) {
    return function (color1) {
        return function (color2) {
            return function (i, j) {
                const h = Math.sqrt(3) * size / 2;
                
                const offset = get_offset(j, 2 * h, 0.5, size / 2);

		const [x, y] = ij2xy((i + offset), size, j, h);
		const p = y / h;

                if (x > p * size / 2 && x - size / 2 < (1 - p ) * size / 2)
                    return color1;
                else
                    return color2;
            };
        };
    };
}

/* Texture : paving of color1, color2 and color3 hexagons
 *
 * @param size side size of hexagons
 * @param color1 first color of the paving (rgba 4-upple format)
 * @param color2 second color of the paving (rgba 4-upple format)
 * @param color3 third color of the paving (rgba 4-upple format)
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position   
 */
function texture_hexagonTiling(size) {
    return function (color1) {
        return function (color2) {
            return function (color3) {
                return function (i, j) {
                    const h = Math.sqrt(3) * size / 2;
		    
		    const offset = get_offset(i, 3 * size, 0.5, h);
		    const [x, y] = ij2xy(i, 3 * size / 2, (j + offset), 2 * h);
		    
		    const cond1 = (j + 3 * offset) % (6 * h) > 2 * h;
		    const cond2 = (j + 3 * offset) % (6 * h) > 4 * h;

		    const realcolor1 = cond1 ? cond2 ? color3 : color2 : color1;
		    const realcolor2 = cond1 ? cond2 ? color1 : color3 : color2;
		    const realcolor3 = cond1 ? cond2 ? color2 : color1 : color3;

                    const p1 = 1 - y / h;
		    const p2 = (y - h) / h;
		    if (x > p1 * size / 2 && x > p2 * size / 2)
			return realcolor1;
		    else if (y < h)
			return realcolor2;
		    else 
			return realcolor3;
                };
            };
        };
    };
}

/* Texture :
 *
 *
 */
function texture_caireTiling(size) {
    return function (angle) {
        return function (color1) {
            return function (color2) {
                return function (color3) {
                    return function (color4) {
                        return function (i, j) {
                            const alpha = angle * Math.PI / 180;
                            const small_h = Math.cos(alpha / 2) * size;
                            const big_h = Math.sin(alpha / 2) * size;
                            const h = big_h + small_h;
                            const offset = get_offset(j, 4 * big_h, 0.5, 2 * big_h);
			    
			    const [x, y] = ij2xy(i + offset, 4 * big_h, j, 2 * big_h);
           
                            const p1 = y / (2 * big_h);
                            const p2 = 1 - (y - (big_h - small_h)) / (2 * small_h);

                            const cond1 = (x - (big_h - small_h)) < p1 * (2 * small_h) || (x - (3 * big_h - small_h) > (1 - p1) * (2 * small_h));
                            const cond2 = (x < p2 * (2 * big_h) || x - (2 * big_h) > (1 - p2) * (2 * big_h));
                            const cond3 = (x < 2 * big_h);

                            if (cond1 && cond2)
                                return color1;
                            else if (cond1 && cond3 || cond2 && !cond3)
                                return color2;
                            else if (cond1 && !cond3 || cond2 && cond3)
                                return color3;
                            else
                                return color4;
                        };
                    };
                };
            };
        };
    };
}


/* Texture : 
 *
 *
 */
function texture_3Dcube(size) {
    return function (colorU) {
        return function (colorL) {
            return function (colorR) {
                return function (i, j) {
                    const h = Math.sqrt(2) * size / 2;
                    const offset = get_offset(j, 3 * size, 0.5, h);

		    const [x, y] = ij2xy(i + offset, 2 * h, j, 3 * size / 2);
                
                    const p1 = 2 * y / size;
                    const p2 = 2 * (y - size) / size;
                    if (x > p1 * h && x - h < (1 - p1) * h)
                        return colorU;
                    else if (x < p2 * h || x - h > (1 - p2) * h)
                        return colorU;
                    else if (x < h)
                        return colorL;
                    else
                        return colorR;
                };
            };
        };
    };
}

/* Texture : 
 *
 *
 */
function texture_3DgambarTiling(size) {
    return function (colorU) {
        return function (colorL) {
            return function (colorR) {
                return function (i, j) {
                    const h = Math.sqrt(2) * size / 2;
                    const offset = get_offset(j, 3 * size, 0.5, 3 * h);
		
		    const [x, y] = ij2xy(i + offset, 6 * h, j, 3 * size / 2);
        
                    const p1 = 2 * y / size;
                    const p2 = 2 * (y - size) / size;
                    if (x - 2 * h > p1 * h && x - 5 * h < (1 - p1) * h)
                        return colorU;
                    else if (x < p2 * h || (x - h > (1 - p2) * h && x - 2 * h < p2 * h) || x - 5 * h > (1 - p2) * h)
                        return colorU;
                    else if (x < h || (x > 2 * h && x < 4 * h))
                        return colorL;
                    else
                        return colorR;
                };
            };
        };
    };
}

/* Texture : 
 *
 *
 */
function texture_elongatedTriangular(size) {
    return function (colorT1) {
        return function (colorT2) {
            return function (colorS1) {
                return function (colorS2) {
                    return function (i, j) {
                        const h = Math.sqrt(2) * size / 2;
                        const offset = get_offset(j, 2 * (h + size), 0.5, size / 2);

			const [x, y] = ij2xy(i + offset, size, j, h + size);
                       
                        const realcolorS = (i + offset) % (2 * size) > size ? colorS2 : colorS1;

                        if (y > size) {
                            const p = (y - size) / h;
                            if (x > p * size / 2 && x < (1 - p / 2) * size)
                                return colorT1;
                            else
                                return colorT2;
                        }
                        return realcolorS;
                    };
                };
            };
        };
    };
}

/* Texture : 
 *
 *
 */
function texture_snubSquare(size) {
    return function (colorT1) {
        return function (colorT2) {
            return function (colorS) {
                return function (i, j) {
                    const h = Math.sqrt(2) * size / 2;
                    const offset = get_offset(j, 2 * h + size, 0.5, h + size / 2 );
		
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
            };
        };
    };
}

/* Texture : truncated square tiling
 *
 * @param size side size of squares and hexagons
 * @param colorS square's color
 * @param colorH1 hexagon's first color
 * @param colorH2 hexagon's second color
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_truncatedSquare(size) {
    return function (colorS) {
        return function (colorH1) {
            return function (colorH2) {
                return function (i, j) {
                    const h = Math.sqrt(2) * size / 2;
                    const p = j % (h + size) > h ? 1 : j % (h + size) / h;

                    const offset = get_offset(j, 2 * (h + size), 0.5, h + size);
		    const [x, y] = ij2xy(i + offset, 2 * (h + size), j, h + size);

		    const realcolorH1 = j % (2 * (h + size)) > h + size ? colorH1 : colorH2;
		    const realcolorH2 = j % (2 * (h + size)) > h + size ? colorH2 : colorH1;
		    
                    if (x > h && x < h + size &&  y > h)
                        return colorS;
                    if (x > p * h && x - (h + size) < (1 - p) * h)
                        return realcolorH1;
                    else
                        return realcolorH2;
                };
            };
        };
    };
}

/* Texture : 
 *
 *
 */
function texture_truncatedHexagon(size) {
    return function (colorT) {
        return function (colorH1) {
            return function (colorH2) {
                return function (colorH3) {
                    return function (i, j) {
                        const h = Math.sqrt(2) * size / 2;
                        const offset = get_offset(j, 2 * (2 * h + (1 + Math.sin(Math.PI / 6)) * size), 0.5, size * (1 + Math.cos(Math.PI / 6)));

                        // changing the color in order to match the pattern
                        const cond1 = ((i + 3 * offset) % (3 * (2 * size * (1 + Math.cos(Math.PI / 6)))) > (2 * size * (1 + Math.cos(Math.PI / 6))));
                        const cond2 = ((i + 3 * offset) % (3 * (2 * size * (1 + Math.cos(Math.PI / 6)))) > 2 * (2 * size * (1 + Math.cos(Math.PI / 6))));
                        const realcolorH1 = cond1 ? (cond2 ? colorH3 : colorH2) : colorH1;
                        const realcolorH2 = cond1 ? (cond2 ? colorH1 : colorH3) : colorH2;
                        const realcolorH3 = cond1 ? (cond2 ? colorH2 : colorH1) : colorH3;

			const [x, y] = ij2xy(i + offset, 2 * size * (1 + Math.cos(Math.PI / 6)), j, (2 * h + (1 + Math.sin(Math.PI / 6)) * size))
                        if (y < Math.sin(Math.PI / 6) * size) {
                            const p1 = 1 - (y / (Math.sin(Math.PI / 6) * size));
                            if (x - size / 2 < p1 * Math.cos(Math.PI / 6) * size)
                                return realcolorH1;
                            else if (x - (3 / 2 + Math.cos(Math.PI / 6)) * size > (1 - p1) * Math.cos(Math.PI / 6) * size)
                                return realcolorH2;
                        }
                        else if (y < Math.sin(Math.PI / 6) * size + h) {
                            const p2 = 1 - (y - Math.sin(Math.PI / 6) * size) / h;
                            if (x < p2 * size / 2 || x - 2 * size * (3 / 4 + Math.cos(Math.PI / 6)) > (1 - p2) * size / 2)
                                return colorT;
                        }
                        else if (y > (1 + Math.sin(Math.PI / 6)) * size + h) {
                            const p3 = (y - ((1 + Math.sin(Math.PI / 6)) * size + h)) / h;
                            if (x < p3 * size / 2 || x - 2 * size * (3 / 4 + Math.cos(Math.PI / 6)) > (1 - p3) * size / 2)
                                return colorT;
                        }
                        return realcolorH3;
                    };
                };
            };
        };
    };
}

/* Texture : small rhombitrihexagonal tiling
 *
 * @param size side size of squares, triangles and hexagons
 * @param colorS square's color
 * @param colorT triangle's color
 * @param colorH hexagon's color
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position 
 */
function texture_smallRhombitrihexagonalTiling(size) {
    return function (colorS) {
        return function (colorT) {
            return function (colorH) {
                return function (i, j) {
                    const h = Math.sqrt(3) * size / 2;
                    const offset = get_offset(j, 2 * (h + size * (1 + Math.sin(Math.PI / 6))), 0.5, (Math.cos(Math.PI / 6) + 1 / 2) * size);

                    const [x, y] = ij2xy(i + offset,(2 * Math.cos(Math.PI / 6) + 1) * size , j,h + size * (1 + Math.sin(Math.PI / 6)));
                    // top 
                    if (y < size / 2) {
                        if (x > Math.cos(Math.PI / 6) * size && x < (1 + Math.cos(Math.PI / 6)) * size)
                            return colorS;
                        else
                            return colorH;
                    }
                    // middle
                    else if (y < h + size * (1 / 2 + Math.sin(Math.PI / 6))) {
                        // color triangle
                        const p1 = y < h + size / 2 ? (y - size / 2) / h % 1 : 1;
                        const p2 = y > (1 / 2 + Math.sin(Math.PI / 6)) * size ? 1 - ((y - (1 / 2 + Math.sin(Math.PI / 6)) * size) / h % 1) : 1;
                        if (x - Math.cos(Math.PI / 6) * size > p1 * size / 2 && x - Math.cos(Math.PI / 6) * size < (1 - p1 / 2) * size
                            || x - (1 / 2 + 2 * Math.cos(Math.PI / 6)) * size > p2 * size / 2 || x < (1 - p2) * size / 2)
                            return colorT;
                        // color hexagon 
                        const p3 = y < (1 / 2 + Math.sin(Math.PI / 6)) * size ? ((y - size / 2) / (Math.sin(Math.PI / 6) * size)) % 1 : 1;
                        const p4 = y > h + size / 2 ? 1 - ((y - (h + size / 2)) / (Math.sin(Math.PI / 6) * size)) % 1 : 1;
                        if (x < (1 - p3) * size * Math.cos(Math.PI / 6) || x - (1 + Math.cos(Math.PI / 6)) * size > p3 * size * Math.cos(Math.PI / 6)
                            || x - size / 2 > p4 * size * Math.cos(Math.PI / 6) && x - size / 2 < (2 - p4) * Math.cos(Math.PI / 6) * size)
                            return colorH;
                        // color Square
                        else
                            return colorS;
                    }
                    // bottom
                    else
                        if (x > size / 2 && x < (1 / 2 + 2 * Math.cos(Math.PI / 6)) * size)
                            return colorH;
                        else
                            return colorS;
                };
            };
        };
    };
}

/* Texture : trihexagonal tiling
 *
 * @param size side size of hexagons and triangles
 * @param colorT triangle's color
 * @param colorH hexagon's color
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_trihexagonal(size) {
    return function (colorT) {
        return function (colorH) {
            return function (i, j) {
                const h = Math.sqrt(3) * size / 2;
                const p = j % (2 * h) > h ? j / h % 1 : 1 - j / h % 1;
                const offset = get_offset(j, 4 * h, 0.5, size);

		const [x, y] = ij2xy(i + offset, 2 * size, j, h);

                if (x > p * size / 2 && (i + offset) % (2 * size) < (2 - p / 2) * size)
                    return colorH(x, y);
                else
                    return colorT((i + offset + size / 2) % (2 * size), j % h);
            };
        };
    };
}

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
function texture_squareTiling(width) {
    return function (height) {
        return function (row) {
            return function (column) {
                return function (color1) {
                    return function (color2) {
                        return function (i, j) {
                            const size_x = width / column;
                            const size_y = height / row;

			    const [x, y] = ij2xy(i, 2 * size_x, j, 2 * size_y);

                            if (y < size_y) {
                                if (x < size_x)
                                    return color1;
                                else
                                    return color2;
                            } else {
                                if (x < size_x)
                                    return color2;
                                else
                                    return color1;
                            }
                        };
                    };
                };
            };
        };
    };
}

/* Texture : PerlinNoise board
 *
 * @param row number of rows
 * @param column numbe of column
 * @param nb_colors number of color
 * @param colors list of all colors in a array
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position   
 */
function texture_perlinNoise(row) {
    return function (column) {
        return function (nb_colors) {
            return function (colors) {

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
                function get_Colors(nb_colors, value) {
                    return Math.floor(value / ([1, 2, 3, 4, 5].map((x) => 1 / x))[nb_colors - 1]);
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
                    return colors[get_Colors(nb_colors, value)];
                };
            };
        };
    };
}



function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function texture_whiteNoise() {
    return (x, y) => [getRandomInt(256),
    getRandomInt(256),
    getRandomInt(256),
        255];
}

function getFourInterpolateCoordinates(i, j, x, y)
{
    let top = y - j + 1;
    let bottom  = y + j - 1;
    let left = x - i + 1;
    let right = x + i - 1;

    while (top % j != 0) top++;
    while (bottom % j != 0) bottom--;
    while (left % i != 0) left++;
    while (right % i != 0) right--;
    
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
    let cpt = 0;
    return function(height) {
    return function(i) {
    return function(j) {
            
        let pixels = [];
        for (let a = 0; a < width; a++) {
            pixels[a] = [];
	    for (let b = 0; b < height; b++) {
                pixels[a][b] = [];
                if (a % i === 0 && b % j === 0)
                {
	            pixels[a][b][0] = getRandomInt(256); // Red channel
	            pixels[a][b][1] = getRandomInt(256); // Green channel
	            pixels[a][b][2] = getRandomInt(256); // Blue channel
	            pixels[a][b][3] = 255; // Alpha channel
                }
                else
                {
                    pixels[a][b][0] = 255; // Red channel
	            pixels[a][b][1] = 255; // Green channel
	            pixels[a][b][2] = 255; // Blue channel
	            pixels[a][b][3] = 255; // Alpha channel
                }
	    }
        }

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
                // full square case
                if (typeof(x) != 'number' && typeof(y) != 'number')
                    return [255, 255, 255, 255];

                let [top, bottom, left, right] = getFourInterpolateCoordinates(i, j, x, y);

                let redVal = 0; 
                let greVal = 0; 
                let bluVal = 0; 
                let alpVal = pixels[left][top][3];

                let neighboors = [];
                
                neighboors.push({x:left, y:top, dist: Math.abs(x - left) + Math.abs(y - top)});

                if (right < width)
                {
                    neighboors.push({x:right, y:top, dist: Math.abs(x - right) + Math.abs(y - top)});
                }
                
                if (bottom < height)
                {
                    neighboors.push({x:left, y:bottom, dist: Math.abs(x - left) + Math.abs(y - bottom)});
                }
                
                if (bottom < height && right < width)
                {
                    neighboors.push({x:right, y:bottom, dist: Math.abs(x - right) + Math.abs(y - bottom)});
                }

                const distMax = neighboors.reduce((acc,el) => acc += el.dist, 0);
                neighboors.sort((el1, el2) => el1.dist - el2.dist);

                
                for (let k = 0; k < neighboors.length / 2; ++k)
                {
                    let tmp = neighboors[k].dist;
                    neighboors[k].dist = neighboors[neighboors.length-k-1].dist;
                    neighboors[neighboors.length-k-1].dist = tmp;
                }

                neighboors.forEach(el => {
                    redVal += pixels[el.x][el.y][0] * (el.dist) / distMax;
                    greVal += pixels[el.x][el.y][1] * (el.dist) / distMax;
                    bluVal += pixels[el.x][el.y][2] * (el.dist) / distMax;
                });

                return [redVal, greVal, bluVal, alpVal];

            }  
        }
    };};};
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
            for (let i = 0; i < nb_case; i++) {
                stock_germs[i] = [getRandomInt(width), getRandomInt(height)];
            }

            // TODO Mettre fonctionnel
            // Return indice of the minest one (min[0]) and the second minest one (min[1])
            function get_two_closest(x, y) {
                let min = [0, 0];
                let gx = 0;
                let gy = 0;
                count += 1;
                for (let i = 1; i < nb_case; i++) {

                    gx = stock_germs[i][0];
                    gy = stock_germs[i][1];

                    // Distance smaller than min[0]
                    if (distance(x, y, stock_germs[min[0]][0], stock_germs[min[0]][1]) >= distance(x, y, gx, gy)) {
                        min[1] = min[0];
                        min[0] = i;

                    }
                    else if (distance(x, y, stock_germs[min[1]][0], stock_germs[min[1]][1]) > distance(x, y, gx, gy)) {
                        min[1] = i;
                    }
                }

                return min;
            }


            function distance(x, y, gx, gy) {
                return Math.sqrt((gx - x) ** 2 + (gy - y) ** 2);
            }

            function distance_smooth(x, y, gx_1, gy_1, gx_2, gy_2) {
                let norme = Math.abs(Math.sqrt((gx_2 - gx_1) ** 2 + (gy_2 - gy_1) ** 2));
                let scalar_x = (x - ((gx_1 + gx_2) / 2)) * ((gx_2 - gx_1) / norme);
                let scalar_y = (y - ((gy_1 + gy_2) / 2)) * ((gy_2 - gy_1) / norme);
                return scalar_x + scalar_y;
            }

            function smoothstep(dist_1, dist_2, epsilon) {
                if (Math.abs(Math.floor(dist_1) - Math.floor(dist_2)) < epsilon) {
                    return true;
                }

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
                let bord = 2;
                if (dist_1 <= r) return [0, 0, 255, 255]; //colors.blue;

                /*
                else if (smoothstep(dist_1, dist_2, 2))
                {
                    return colors.black;    
                }
                
                else if (smoothstep(dist_1*3, dist_2, bord))    
                {
                    return colors.green;
                }  */

                else if (distance_smooth(x, y, gx_1, gy_1, gx_2, gy_2) <= 3) return [0, 0, 0, 255]; //colors.black;

                else return [255, 0, 0, 255]; //colors.red;
            };
        };
    };
}
