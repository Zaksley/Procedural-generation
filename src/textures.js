'use strict';

/* Texture : full black square
 * 
 * @param dict.colors    the color to fill (1-element array)
 * @param (x,y)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a black pixel
 */
function texture_solid(dict) {

    const colors = dict['colors']   || [];
    const color = colors[0]         || COLORS.cyan;
    
    return function (x,y) {
        return color;
    };
};

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

    const width = dict['width']     || WIDTH;
    const n = dict['n']             || 3;
    const colors = dict['colors']   || [];
    const color1 = colors[0]        || COLORS.blue;
    const color2 = colors[1]        || COLORS.cyan;

    return function (x,y) {
        return [0, 0, 0, 0].map((e, i) =>
            Math.floor(color1[i] * ((n * (width - x)) % width) / width 
                     + color2[i] * ((n * x) % width) / width));
    };
};

/* Texture : paving of color1 and color2 triangles
 *
 * @param dict.size      side size of triangles
 * @param dict.colors    tiling colors (2-element array)
 * @param (i,j)          coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position   
*/
function texture_triangleTiling(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const color1 = colors[0]        || COLORS.blue;
    const color2 = colors[1]        || COLORS.cyan;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const p = j / h % 1;
        const offset = Math.floor(j / h) % 2 * size / 2;
        if ((i + offset) % size > p * size / 2 && (i + offset) % size < (1 - p / 2) * size)
            return color1;
        else
            return color2;
    };
};

/* Texture : paving of color1, color2 and color3 hexagons
 *
 * @param dict.size     side size of hexagons
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position   
*/
function texture_hexagonTiling(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const color1 = colors[0]        || COLORS.cyan;
    const color2 = colors[1]        || COLORS.orange;
    const color3 = colors[2]        || COLORS.blue;
    
    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const p = j % (2 * h) > h ? 1 - j / h % 1 : j / h % 1;
        if (i % (3 * size) > p * size / 2 && i % (3 * size) < (2 - p / 2) * size) {
            if ((j + h) % (6 * h) < 2 * h)
                return color1;
            else if ((j + h) % (6 * h) < 4 * h)
                return color2;
            else
                return color3;
        } else {
            if (j % (6 * h) < 2 * h)
                return color3;
            else if (j % (6 * h) < 4 * h)
                return color1;
            else
                return color2;
        };
    };
};

/* Texture :
 *
 *
 */
function texture_caireTiling(dict) {

    const size = dict['size']       || 80;
    const angle = dict['angle']     || 135;
    const colors = dict['colors']   || [];
    const color1 = colors[0]        || COLORS.cyan;
    const color2 = colors[1]        || COLORS.orange;
    const color3 = colors[2]        || COLORS.blue;
    const color4 = colors[3]        || COLORS.pink;

    return function (i, j) {
        const alpha = angle * Math.PI / 180;
        const small_h = Math.cos(alpha / 2) * size;
        const big_h = Math.sin(alpha / 2) * size;
        const h = big_h + small_h;
        const offset = j % (4 * big_h) < 2 * big_h ? 0 : 2 * big_h;

        const x = (i + offset) % (4 * big_h);
        const y = j % (2 * big_h);

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


/* Texture : 
 *
 *
 */
function texture_3Dcube(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const colorU = colors[0]        || COLORS.cyan;
    const colorL = colors[1]        || COLORS.orange;
    const colorR = colors[2]        || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(2) * size / 2;
        const offset = j % (3 * size) > 3 * size / 2 ? 0 : h;

        const x = (i + offset) % (2 * h);
        const y = j % (3 * size / 2);

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

/* Texture : 
 *
 *
 */
function texture_3DgambarTiling(dict) {

    const size = dict['size']       || 60;
    const colors = dict['colors']   || [];
    const colorU = colors[0]        || COLORS.cyan;
    const colorL = colors[1]        || COLORS.orange;
    const colorR = colors[2]        || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(2) * size / 2;
        const offset = j % (3 * size) >= 3 * size / 2 ? 0 : 3 * h;

        const x = (i + offset) % (6 * h);
        const y = j % (3 * size / 2);

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

/* Texture : 
 *
 *
 */
function texture_elongatedTriangular(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const colorT1 = colors[0]       || COLORS.cyan;
    const colorT2 = colors[1]       || COLORS.orange;
    const colorS1 = colors[2]       || COLORS.blue;
    const colorS2 = colors[3]       || COLORS.pink;

    return function (i, j) {
        const h = Math.sqrt(2) * size / 2;
        const offset = j % (2 * (h + size)) > h + size ? 0 : size / 2;

        const x = (i + offset) % size;
        const y = j % (h + size);

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

/* Texture : 
 *
 *
 */
function texture_snubSquare(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const colorT1 = colors[0]       || COLORS.cyan;
    const colorT2 = colors[1]       || COLORS.orange;
    const colorS = colors[2]        || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(2) * size / 2;
        const offset = j % (2 * (h + size / 2)) > h + size / 2 ? h + size / 2 : 0;

        const x = (i + offset) % (2 * h + size);
        const y = j % (h + size / 2);

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

/* Texture : truncated square tiling
 *
 * @param dict.size     side size of squares and hexagons
 * @param dict.colors   square's and hexagons' colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position
 */
function texture_truncatedSquare(dict) {

    const size = dict['size']       || 60;
    const colors = dict['colors']   || [];
    const colorS = colors[0]        || COLORS.cyan;
    const colorH1 = colors[1]       || COLORS.orange;
    const colorH2 = colors[2]       || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(2) * size / 2;
        const p = j % (h + size) > h ? 1 : j % (h + size) / h;
        const offset = j % (2 * (h + size)) > h + size ? 0 : h + size;
        if ((i + offset) % (2 * (h + size)) > h && (i + offset) % (2 * (h + size)) < h + size && j % (h + size) > h)
            return colorS;
        if ((i + offset) % (2 * (h + size)) > p * h && (i + offset) % (2 * (h + size)) < (2 - p) * h + size)
            return j % (2 * (h + size)) > h + size ? colorH1 : colorH2;
        else
            return j % (2 * (h + size)) > h + size ? colorH2 : colorH1;
    };
};

/* Texture : 
 *
 *
 */
function texture_truncatedHexagon(dict) {

    const size = dict['size']       || 60;
    const colors = dict['colors']   || [];
    const colorT = colors[0]        || COLORS.cyan;
    const colorH1 = colors[1]       || COLORS.orange;
    const colorH2 = colors[2]       || COLORS.blue;
    const colorH3 = colors[3]       || COLORS.pink;

    return function (i, j) {
        const h = Math.sqrt(2) * size / 2;
        const offset = j % (2 * (2 * h + (1 + Math.sin(Math.PI / 6)) * size)) > (2 * h + (1 + Math.sin(Math.PI / 6)) * size) ? (size * (1 + Math.cos(Math.PI / 6))) : 0;

        // changing the color order to match the pattern
        const cond1 = ((i + 3 * offset) % (3 * (2 * size * (1 + Math.cos(Math.PI / 6)))) > (2 * size * (1 + Math.cos(Math.PI / 6))));
        const cond2 = ((i + 3 * offset) % (3 * (2 * size * (1 + Math.cos(Math.PI / 6)))) > 2 * (2 * size * (1 + Math.cos(Math.PI / 6))));
        const realcolorH1 = cond1 ? (cond2 ? colorH3 : colorH2) : colorH1;
        const realcolorH2 = cond1 ? (cond2 ? colorH1 : colorH3) : colorH2;
        const realcolorH3 = cond1 ? (cond2 ? colorH2 : colorH1) : colorH3;

        const x = (i + offset) % (2 * size * (1 + Math.cos(Math.PI / 6)));
        const y = j % (2 * h + (1 + Math.sin(Math.PI / 6)) * size);
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

/* Texture : small rhombitrihexagonal tiling
 *
 * @param dict.size     side size of squares, triangles and hexagons
 * @param dict.colors   square, triangle & hexagon colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (x,y) position 
 */
function texture_smallRhombitrihexagonalTiling(dict) {
    
    const size = dict['size']       || 60;
    const colors = dict['colors']   || [];
    const colorS = colors[0]        || COLORS.cyan;
    const colorT = colors[1]        || COLORS.orange;
    const colorH = colors[2]        || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = j % (2 * (h + size * (1 + Math.sin(Math.PI / 6)))) > (h + size * (1 + Math.sin(Math.PI / 6))) ? (Math.cos(Math.PI / 6) + 1 / 2) * size : 0;
        const x = (i + offset) % ((2 * Math.cos(Math.PI / 6) + 1) * size);
        const y = j % (h + size * (1 + Math.sin(Math.PI / 6)));
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

/* Texture : trihexagonal tiling
 *
 * @param dict.size     side size of hexagons and triangles
 * @param dict.colors   triangle & hexagon colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position
 */
function texture_trihexagonal(dict) {

    const size = dict['size']       || 60;
    const colors = dict['colors']   || [];
    const colorT = colors[0]        || texture_solid({colors: [COLORS.cyan]});
    const colorH = colors[1]        || texture_solid({colors: [COLORS.orange]});

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const p = j % (2 * h) > h ? j / h % 1 : 1 - j / h % 1;
        const offset = j % (4 * h) > 2 * h ? 0 : size;
        if ((i + offset) % (2 * size) > p * size / 2 && (i + offset) % (2 * size) < (2 - p / 2) * size)
            return colorH((i + offset) % (2 * size), j % h);
        else
            return colorT((i + offset + size / 2) % (2 * size), j % h);
    };
};

/* Texture : checkerboard of color1 and color2 rectangles
 *
 * @param dict.width    canvas width
 * @param dict.height   canvas height
 * @param dict.rows     number of rows
 * @param dict.columns  number of columns
 * @param dict.colors   tiling colors (2-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (x,y) position   
*/
function texture_squareTiling(dict) {

    const width = dict['width']     || WIDTH;
    const height = dict['height']   || HEIGHT;
    const rows = dict['rows']       || 5;
    const columns = dict['columns'] || 5;
    const colors = dict['colors']   || [];
    const color1 = colors[0]        || COLORS.cyan;
    const color2 = colors[1]        || COLORS.orange;

    return function (x, y) {
        const size_x = width / columns;
        const size_y = height / rows;
        if (y % (2 * size_y) < size_y) {
            if (x % (2 * size_x) < size_x)
                return color1;
            else
                return color2;
        } else {
            if (x % (2 * size_x) < size_x)
                return color2;
            else
                return color1;
        }
    };
};

/* Texture : PerlinNoise board
 *
 * @param row number of rows
 * @param column numbe of column
 * @param nb_colors number of color
 * @param colors list of all colors in a array
 * @param (i,j) coordinates of the pixel
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

function getTwoInterpolateIndices(i, n) {
    let before = n - i + 1;
    let after = n + i - 1;
    while (before % i !== 0) before++;
    while (after % i !== 0) after--;

    return [before, after];
}

function getFourInterpolateCoordinates(i, j, x, y) {
    let left = y - j + 1;
    let right = y + j - 1;
    let top = x - i + 1;
    let bottom = x + i - 1;

    while (top % i !== 0) top++;
    while (bottom % i !== 0) bottom--;
    while (left % j !== 0) left++;
    while (right % j !== 0) right--;

    return [top, bottom, left, right];
}


/* Texture : band-limited white noise
 *
 * @param width  canvas width
 * @param height canvas height
 * @param i number of lines skipped
 * @param j number of columns skipped
 * @param (i,j) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_limitedWhiteNoise(width) {
    return (height) => (i) => (j) => {
        let pixels = [];
        for (let x = 0; x < width; x++) {
            pixels[x] = [];
            for (let y = 0; y < height; y++) {
                pixels[x][y] = [];
                if (x % i === 0 && y % j === 0) {
                    pixels[x][y][0] = getRandomInt(256); // Red channel
                    pixels[x][y][1] = getRandomInt(256); // Green channel
                    pixels[x][y][2] = getRandomInt(256); // Blue channel
                    pixels[x][y][3] = 255; // Alpha channel
                }
                else {
                    pixels[x][y][0] = 255; // Red channel
                    pixels[x][y][1] = 255; // Green channel
                    pixels[x][y][2] = 255; // Blue channel
                    pixels[x][y][3] = 255; // Alpha channel
                }
            }
        }

        return (x, y) => {
            if (x % i === 0 && y % j === 0) {
                return [pixels[x][y][0],
                pixels[x][y][1],
                pixels[x][y][2],
                pixels[x][y][3]];
            }
            else {
                if (x % i === 0 && y % j !== 0) // top - bottom case
                {
                    let [top, bottom] = getTwoInterpolateIndices(j, y);

                    let redVal = pixels[x][top][0];
                    let greVal = pixels[x][top][1];
                    let bluVal = pixels[x][top][2];
                    let alpVal = pixels[x][top][3];

                    if (bottom < height) {
                        redVal = Math.floor((pixels[x][top][0] + pixels[x][bottom][0]) / 2);
                        greVal = Math.floor((pixels[x][top][1] + pixels[x][bottom][1]) / 2);
                        bluVal = Math.floor((pixels[x][top][2] + pixels[x][bottom][2]) / 2);
                        alpVal = Math.floor((pixels[x][top][3] + pixels[x][bottom][3]) / 2);
                    }

                    return [redVal, greVal, bluVal, alpVal];
                }

                if (x % i !== 0 && y % j === 0) // left - right case
                {
                    let [left, right] = getTwoInterpolateIndices(i, x);

                    let redVal = pixels[left][y][0];
                    let greVal = pixels[left][y][1];
                    let bluVal = pixels[left][y][2];
                    let alpVal = pixels[left][y][3];

                    if (right < width) {
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
        };
    };
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
