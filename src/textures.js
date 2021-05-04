'use strict';

// Color dictionnary
const COLORS = {
    blue: [0, 0, 255, 255],
    red: [255, 0, 0, 255],
    pink: [255, 192, 203, 255],
    green: [0, 255, 0, 255],
    black: [0, 0, 0, 255],
    white: [255, 255, 255, 255],
    orange: [255, 128, 0, 255],
    cyan: [0, 255, 128, 255],
    grey: [128,128,128,255],
    silver: [192,192,192,255],
};

/* Returns a color from its name
 *
 * @param color the color name
 * @return a color 4-array
 */
function getColor(color) {
   switch(color){
      // Base colors
      case "white":  return COLORS.white;
      case "black":  return COLORS.black;
      case "grey":   return COLORS.grey;
      case "silver": return COLORS.silver;
      case "blue":   return COLORS.blue;
      case "red":    return COLORS.red;
      case "green":  return COLORS.green;

      // Advanced colors
      case "orange": return COLORS.orange;
      case "cyan":   return COLORS.cyan;
      case "pink":   return COLORS.pink;
      default: return COLORS.black;
   }
}

function ij2xy(i, width, j, height) {
    let x = i;
    let y = j;
    while (x < 0)
        x += width;
    while (y < 0)
        y += height;
    return [x % width, y % height];
}

function get_offset(coord, freq, percent, offset) {
    if (coord < 0)
        return (-coord / freq) % 1 < percent ? offset : 0;
    return (coord / freq) % 1 < percent ? 0 : offset;
}

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
    let [coords_prime, index_list] = []
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
            const p = (a[1] - b[1]) / (c[1] - b[1])
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
        const p1 = (array[(min + 1) % N][1] - array[min][1]) / (array[(min + 1) % N][0] - array[min][0])
        const p2 = (array[(N + min - 1) % N][1] - array[min][1]) / (array[(N + min - 1) % N][0] - array[min][0])
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
    }
}

function randomPolygon(n) {
    let polygon = [];
    for(let i = 0; i < n; i++) {
        polygon[i] = [getRandomInt(WIDTH), getRandomInt(HEIGHT)];
    }
    return polygon;
}

function testInShape(dict) {

   let coords = dict['coords']   || [];
   //const coords = [[100, 100], [200, 125], [300, 125], [400, 100], [375, 200], [375, 300],  [400, 400], [300, 375], [200, 375], [100, 400], [125, 300], [125, 200]];
   coords = [[100, 100], [225, 200], [250, 150], [275, 200], [400, 100], [300, 225], [350, 250], [300, 275], [400, 400], [275, 300], [250, 350], [225, 300], [100, 400], [200, 275], [150, 250], [200, 225]];
   const testIsInShape = isInShape(coords);
   return function(x, y) {
      if (testIsInShape(x, y))  
         return COLORS.black;
      return COLORS.grey;
   };
}

/* Texture : texture star
 *
 * @param dict.branches number of branches
 * @param dict.size radius of the inner circle and 1/3 of the outer one
 * @param dict.center center coordinates
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_star(dict) {
    const n = dict['branches']      || 5;
    const r = dict['size']          || 50;
    const center = dict['center']   || [];
    const center_x = center[0]      || dict['centerx'] || WIDTH / 2;
    const center_y = center[1]      || dict['centery'] || HEIGHT / 2;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;
    const coords = [];

    for(let k = 0; k < n; k++) {
        coords.push([3 * r * Math.cos(k / n * 2 * Math.PI) + center_x, 3 * r * Math.sin(k / n * 2 * Math.PI) + center_y]);
        coords.push([r * Math.cos((k + 1 / 2)/ n * 2 * Math.PI) + center_x, r * Math.sin((k + 1 / 2) / n * 2 * Math.PI) + center_y]);
    }

    const testIsInShape = isInShape(coords);
    return function(x, y) {
        if (testIsInShape(x, y))
            return color1;
        return color2;
    };
}

/* Texture : texture star
 *
 * @param dict.branches number of branches
 * @param dict.size radius of the inner circle and 1/3 of the outer one
 * @param dict.center center coordinates
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_doubleStar(dict) {
    const n = dict['branches']      || 5;
    const r1 = dict['size']         || 50;
    const r2 = dict['size2']        || 70;
    const center = dict['center']   || [];
    const center_x = center[0]      || dict['centerx'] || WIDTH / 2;
    const center_y = center[1]      || dict['centery'] || HEIGHT / 2;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;
    const coords = [];

    for(let k = 0; k < n; k++) {
        coords.push([3 * r1 * Math.cos(k / n * 2 * Math.PI) + center_x, 3 * r1 * Math.sin(k / n * 2 * Math.PI) + center_y]);
        coords.push([r1 * Math.cos((k + 1 / 4)/ n * 2 * Math.PI) + center_x, r1 * Math.sin((k + 1 / 4) / n * 2 * Math.PI) + center_y]);
        coords.push([3 * r2 * Math.cos((k + 1 / 2) / n * 2 * Math.PI) + center_x, 3 * r2 * Math.sin((k + 1 / 2) / n * 2 * Math.PI) + center_y]);
        coords.push([r1 * Math.cos((k + 3 / 4)/ n * 2 * Math.PI) + center_x, r1 * Math.sin((k + 3 / 4) / n * 2 * Math.PI) + center_y]);
    }

    const testIsInShape = isInShape(coords);
    return function(x, y) {
        if (testIsInShape(x, y))
            return color1;
        return color2;
    };
}

function texture_regularShape(dict) {
    const n = dict['branches']      || 4;
    const r = dict['r']             || dict['size'] / (2 * Math.sin(Math.PI / n)) || 100;
    const center = dict['center']   || [];
    const center_x = center[0]      || dict['centerx'] || WIDTH / 2;
    const center_y = center[1]      || dict['centery'] || HEIGHT / 2;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;

    const coords = [];

    for(let k = 0; k < n; k++) 
        coords.push([r * Math.cos(k / n * 2 * Math.PI) + center_x, r * Math.sin(k / n * 2 * Math.PI) + center_y]);

    const testIsInShape = isInShape(coords);
    return function(x, y) {
        if (testIsInShape(x, y))
            return color1;
        return color2;
    };
}

/* Texture : transparent image
 *
 * @return a transparent pixel
 */
function texture_none() {
   return function() {
      return [0,0,0,0];
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

   const colors = dict['colors']   || [];
   const color = dict['color1']    || colors[0] || COLORS.cyan;

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

   const width = dict['width']     || WIDTH;
   const n = dict['columns']       || 3;
   const a = dict['angle']         || 0;
   const colors = dict['colors']   || [];
   const color1 = dict['color1']   || colors[0] || COLORS.blue;
   const color2 = dict['color2']   || colors[1] || COLORS.cyan;

   return function (x, y) {
      function mod(n,m){
         let r = n%m;
         return (r >= 0 ? r : mod(r+m,m));
      }
      const ap = mod(a,360);
      const th = 2*Math.PI*ap/360;
      const length = (ap%90 === 0) ? width : width*Math.sqrt(2);
      let pos = (Math.cos(th)*x - Math.sin(th)*(y-width));
      if(ap >= 180){
         if(ap >= 270){
            pos = pos - width*Math.sin(th);
         }else{
            pos = pos - width*(Math.cos(th)+Math.sin(th));
         }
      }else{
         if(ap >= 90){
            pos = pos - width*Math.cos(th);
         }
      }
      //console.log(length);
      return [0,0,0].map((e,i) => Math.floor(
            color1[i]* ((n*(length-pos))%(length+1)) / length
          + color2[i]* ((n*(pos))%(length+1)) / length
         )).concat(255);
   };
}

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
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;

        const offset = get_offset(j, 2 * h, 0.5, size / 2);

        const [x, y] = ij2xy((i + offset), size, j, h);
        const p = y / h;

        if (x > p * size / 2 && x - size / 2 < (1 - p) * size / 2)
            return color1;
        else
            return color2;
    };
}

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
    const color1 = dict['color1']   || colors[0] || COLORS.cyan;
    const color2 = dict['color2']   || colors[1] || COLORS.orange;
    const color3 = dict['color3']   || colors[2] || COLORS.blue;

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
}

/* Texture : Caire Tiling
 *
 * @param dict.size     side size of pentagons
 * @param dict.angle    angle of the pentagon paving
 * @param dict.colors   tiling colors (4-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_caireTiling(dict) {

    const size = dict['size']       || 80;
    const angle = dict['angle']     || 135;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.cyan;
    const color2 = dict['color2']   || colors[1] || COLORS.orange;
    const color3 = dict['color3']   || colors[2] || COLORS.blue;
    const color4 = dict['color4']   || colors[3] || COLORS.pink;

    return function (i, j) {
        const alpha = angle * Math.PI / 180;
        const small_h = Math.cos(alpha / 2) * size;
        const big_h = Math.sin(alpha / 2) * size;
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
}

/* Texture pentagon tiling 3 (WORK IN PROGRESS)
 *
 * @param dict.size     side size of pentagons
 * @param dict.angle    angle of the pentagon paving
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_pentagonTiling3(dict) {
    const size = dict['size']       || 80;
    const angle = dict['angle']     || 110;
    const colors = dict['colors']   || [];
    const colorU = dict['color1']   || colors[0] || COLORS.cyan;
    const colorL = dict['color2']   || colors[1] || COLORS.black;
    const colorR = dict['color3']   || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;

        const offset = get_offset(j, 3 * size, 0.5, h);
        const [x, y] = ij2xy(i + offset, 2 * h, j, 3 * size / 2);

        const realAngle = angle % 120;
        const realColorU = angle % 360 < 240 ? angle % 360 < 120 ? colorU : colorR : colorL;
        const realColorL = angle % 360 < 240 ? angle % 360 < 120 ? colorL : colorU : colorR;
        const realColorR = angle % 360 < 240 ? angle % 360 < 120 ? colorR : colorL : colorU;

        const alpha = realAngle * Math.PI / 180;

        const p1 = (size / 2 - y) / Math.sin(alpha);
        const p2 = (size / 2  - y) / Math.sin(alpha - 2 * Math.PI / 3);
        const p3 = (size / 2  - y) / Math.sin(alpha + 2 * Math.PI / 3);
        const p4 = (y - size) / (size / 2);
        const p5 = (2 * size - y) / Math.sin(alpha);
        const p6 = (2 * size - y) / Math.sin(alpha + 2 * Math.PI / 3);

        const cond1 = x - h < p1 * Math.cos(alpha);
        const cond2 = x - h < p2 * Math.cos(alpha - 2 * Math.PI / 3);
        const cond3 = realAngle > 60 ? x - h < p3 * Math.cos(alpha + 2 * Math.PI / 3): x - h > p3 * Math.cos(alpha + 2 * Math.PI / 3);

        const cond4 = x < p4 * h;
        const cond5 = x - h > (1 - p4) * h;
        const cond6 = x - 2 * h < p5 * Math.cos(alpha);
        const cond7 = x < p5 * Math.cos(alpha);
        const cond8 = realAngle > 60 ? false : x - 2 * h < p6 * Math.cos(alpha + 2 * Math.PI / 3);

        if (cond1 && cond3 && !cond4 || cond5 && cond6 && !cond8 || cond4 && cond7)
            return realColorU;
        else if (!cond2 && !(cond8 && cond5)|| cond4 && !cond8 || cond5 && !cond6 && !cond8)
            return realColorR;
        else
            return realColorL;
    };
}

/* Texture pentagon tiling 4
 *
 * @param dict.size     side first size of pentagons
 * @param dict.size2    side second size of pentagons
 * @param dict.angle    angle of the pentagon paving
 * @param dict.colors   tiling colors (4-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_pentagonTiling4(dict) {
    const a = dict['size']         || 50;
    const b = dict['size2']        || 70;
    const angle = dict['angle']    || 120;
    const colors = dict['colors']  || [];
    const color1 = dict['color1']  || colors[0] || COLORS.blue;
    const color2 = dict['color2']  || colors[1] || COLORS.red;
    const color3 = dict['color3']  || colors[2] || COLORS.orange;
    const color4 = dict['color4']  || colors[3] || COLORS.cyan;

    return function (i, j) {
        const alpha = (angle - 90) * Math.PI / 180;
       
        const x_offset = Math.floor(j / (a + b * (Math.cos(alpha) + Math.sin(alpha)))) * (a + b * (Math.sin(alpha) - Math.cos(alpha)));
        const y_offset = Math.floor((i + x_offset)  / (a + b * (Math.cos(alpha) + Math.sin(alpha)))) * (2 * b * Math.cos(alpha));
        const [x, y] = ij2xy(i + x_offset, a + b * (Math.cos(alpha) + Math.sin(alpha)), j + y_offset, a + b * (Math.cos(alpha) + Math.sin(alpha)));
        
        const p1 = (y - b * Math.cos(alpha)) / (b * Math.sin(alpha));
        const p2 = (y - a) / (b * (Math.cos(alpha) + Math.sin(alpha)) - a);
        if ((x + b * Math.sin(alpha) > p1 * b * Math.cos(alpha)) && x < a && x - b * (Math.cos(alpha) - Math.sin(alpha)) < (1 - p2) * (a + b * (Math.sin(alpha) - Math.cos(alpha))))
            return color1;
        const p3 = (y - a) / (b * Math.sin(alpha));
        const p4 = 1 - (y - (a + b * (Math.sin(alpha) - Math.cos(alpha)))) / (b * Math.cos(alpha));
        const p5 = y / (a + b * (Math.cos(alpha) - Math.sin(alpha)));
        if (x - 2 * a < p5 * (b * (Math.cos(alpha) + Math.sin(alpha)) + a)) {
            if (x - a > p3 * b * Math.cos(alpha)) {
                if (x - (a + b * Math.cos(alpha)) < p4 * b * Math.sin(alpha))
                    return color2;
                else
                    return color1;
            }
            else if (x > b * (Math.cos(alpha) - Math.sin(alpha)) && x - (a + b * Math.cos(alpha)) < p4 * b * Math.sin(alpha))
                return color3;
        }
        return color4;
    };

}

/* Texture : 3D cube (rhombile tiling)
 *
 * @param dict.size     side first size of shapes
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_3Dcube(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const colorU = dict['color1']   || colors[0] || COLORS.cyan;
    const colorL = dict['color2']   || colors[1] || COLORS.orange;
    const colorR = dict['color3']   || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
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
}
 
/* Texture : 3D gambar tiling
 *
 * @param dict.size     side first size of shapes
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_3DgambarTiling(dict) {

    const size = dict['size']       || 60;
    const colors = dict['colors']   || [];
    const colorU = dict['color1']   || colors[0] || COLORS.cyan;
    const colorL = dict['color2']   || colors[1] || COLORS.orange;
    const colorR = dict['color3']   || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
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
}

/* Texture : 
 *
 *
 */
function texture_elongatedTriangular(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const colorT1 = dict['color1']  || colors[0] || COLORS.cyan;
    const colorT2 = dict['color2']  || colors[1] || COLORS.orange;
    const colorS1 = dict['color3']  || colors[2] || COLORS.blue;
    const colorS2 = dict['color4']  || colors[3] || COLORS.pink;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
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
}

/* Texture : snub square tiling
 *
 * @param dict.size     side first size of shapes
 * @param dict.colors   tiling colors (3-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_snubSquare(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const colorT1 = dict['color1']  || colors[0] || COLORS.cyan;
    const colorT2 = dict['color2']  || colors[1] || COLORS.orange;
    const colorS = dict['color3']   || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 2 * h + size, 0.5, h + size / 2);

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
}

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
    const colorS = dict['color1']   || colors[0] || COLORS.cyan;
    const colorH1 = dict['color2']  || colors[1] || COLORS.orange;
    const colorH2 = dict['color3']  || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3   ) * size / 2;
        const p = j % (h + size) > h ? 1 : j % (h + size) / h;

        const offset = get_offset(j, 2 * (h + size), 0.5, h + size);
        const [x, y] = ij2xy(i + offset, 2 * (h + size), j, h + size);

        const realcolorH1 = j % (2 * (h + size)) > h + size ? colorH1 : colorH2;
        const realcolorH2 = j % (2 * (h + size)) > h + size ? colorH2 : colorH1;

        if (x > h && x < h + size && y > h)
            return colorS;
        if (x > p * h && x - (h + size) < (1 - p) * h)
            return realcolorH1;
        else
            return realcolorH2;
    };
}

/* Texture : truncated hexagon tiling
 *
 * @param dict.size     side first size of shapes
 * @param dict.colors   tiling colors (4-element array)
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (i,j) position 
 */
function texture_truncatedHexagon(dict) {

    const size = dict['size']       || 60;
    const colors = dict['colors']   || [];
    const colorT = dict['color1']   || colors[0] || COLORS.cyan;
    const colorH1 = dict['color2']  || colors[1] || COLORS.orange;
    const colorH2 = dict['color3']  || colors[2] || COLORS.blue;
    const colorH3 = dict['color4']  || colors[3] || COLORS.pink;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 2 * (2 * h + 1.5 * size), 0.5, size + h);

        // changing the color in order to match the pattern
        const cond1 = ((i + 3 * offset) % (3 * (2 * (size + h))) > (2 * (size + h)));
        const cond2 = ((i + 3 * offset) % (3 * (2 * (size + h))) > 2 * (2 * (size + h)));
        const realcolorH1 = cond1 ? (cond2 ? colorH3 : colorH2) : colorH1;
        const realcolorH2 = cond1 ? (cond2 ? colorH1 : colorH3) : colorH2;
        const realcolorH3 = cond1 ? (cond2 ? colorH2 : colorH1) : colorH3;

        const [x, y] = ij2xy(i + offset, 2 * (size + h), j, (2 * h + 1.5 * size));
        if (y < size / 2) {
            const p1 = 1 - (y / (size / 2));
            if (x - size / 2 < p1 * h)
                return realcolorH1;
            else if (x - (3 / 2 * size + h) > (1 - p1) * h)
                return realcolorH2;
        }
        else if (y < size / 2 + h) {
            const p2 = 1 - (y - size / 2) / h;
            if (x < p2 * size / 2 || x - (size * 3 / 2 + 2 * h) > (1 - p2) * size / 2)
                return colorT;
        }
        else if (y > 1.5 * size + h) {
            const p3 = (y - (1.5 * size + h)) / h;
            if (x < p3 * size / 2 || x - (size * 3 / 2 + 2 * h) > (1 - p3) * size / 2)
                return colorT;
        }
        return realcolorH3;
    };
}

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
    const colorS = dict['color1']   || colors[0] || COLORS.cyan;
    const colorT = dict['color2']   || colors[1] || COLORS.orange;
    const colorH = dict['color3']   || colors[2] || COLORS.blue;

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 2 * (h + size * 1.5), 0.5, h + size / 2);

        const [x, y] = ij2xy(i + offset, 2 * h + size, j, h + size * 1.5);
        // top 
        if (y < size / 2) {
            if (x > h && x < h + size)
                return colorS;
            else
                return colorH;
        }
        // middle
        else if (y < h + size) {
            // color triangle
            const p1 = y < h + size / 2 ? (y - size / 2) / h % 1 : 1;
            const p2 = y > size ? 1 - ((y - size) / h % 1) : 1;
            if (x - h > p1 * size / 2 && x - h < (1 - p1 / 2) * size
                || x - (2 * h + size / 2) > p2 * size / 2 || x < (1 - p2) * size / 2)
                return colorT;
            // color hexagon 
            const p3 = y < size ? ((y - size / 2) / (size / 2)) % 1 : 1;
            const p4 = y > h + size / 2 ? 1 - ((y - (h + size / 2)) / (size / 2)) % 1 : 1;
            if (x < (1 - p3) * h || x - (h + size) > p3 * h
                || x - size / 2 > p4 * h && x - size / 2 < (2 - p4) * h)
                return colorH;
            // color square
            else
                return colorS;
        }
        // bottom
        else
            if (x > size / 2 && x < 2 * h + size / 2)
                return colorH;
            else
                return colorS;
    };
}

/* Texture : big rhombitrihexagonal tiling
 *
 * @param dict.size     side size of squares, hexagons and dodecagons
 * @param dict.colors   square, hexagon & dodecagon colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (x,y) position 
 */
function texture_bigRhombitrihexagonalTiling(dict) {

    const size = dict['size']       || 60;
    const colors = dict['colors']   || [];
    const colorS = dict['color1']   || colors[0] || COLORS.cyan;
    const colorH = dict['color2']   || colors[1] || COLORS.orange;
    const colorD = dict['color3']   || colors[2] || COLORS.blue;

    return function(i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 2 * (h + size * 1.5), 0.5, size * 1.5 + 3 * h);

        const [x, y] = ij2xy(i + offset, 3 * size + 6 * h, j, h + size * 1.5);

        // top 
        if (y < size) {
            if (x < size)
                return colorS;
            else if (x < size + 2 * h || x >= 3 * size + 4 * h)
                return colorH;
            else 
                return colorD;
        }
        // bottom
        else {
            const p1 = (y - size) / (size / 2);
            const p2 = (y - 3 / 2 * size) / h;
            const p3 = (y - (size + h)) / (size / 2);
            const p4 = (y - size) / h;
            if (x - size > p1 * h && x - (size + h) < (1 - p1) * h || x - (3 * size + 4 * h) > p1 * h && x - (3 * size + 5 * h) < (1 - p1) * h)
                return colorH;
            else if (x - (3 / 2 * size + h) > (1 - p3) * h && x - (3 / 2 * size + 2 * h) < p3 * h || x - (5 / 2 * size + 3 * h) > (1 - p3) * h && x - (5 / 2 * size + 4 * h) < p3 * h)
                return colorH;
            else if (x - (size + h) < p2 * size / 2 || x - (5 / 2 * size + 5 * h) > (1 - p2) * size / 2)
                return colorD;
            else if (x - (size + 2 * h) > p4 * size / 2 && x - (5 / 2 * size + 4 * h) < (1 - p4) * size / 2)
                return colorD;
            else
                return colorS;           
        }
    };
}

/* Texture : snub hexagonal tiling
 *
 * @param dict.size     side size of triangles and hexagons
 * @param dict.colors   triangle & hexagon colors
 * @param (i,j)         coordinates of the pixel
 * @precond each color must be a 4-element array (rgba format)
 * @return a colored pixel corresponding to (x,y) position 
 */
function texture_snubHexagonal(dict) {
    const size = dict['size']       || 60;
    const colors = dict['colors']   || [];
    const colorH = dict['color1']   || colors[0] || COLORS.cyan;
    const colorT1 = dict['color2']   || colors[1] || COLORS.orange;
    const colorT2 = dict['color3']   || colors[2] || COLORS.blue;

    return function(i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = Math.floor(j / (3 * h)) * 6.5 * size;

        const [x, y] = ij2xy(i + offset, 7 * size, j, 3 * h);

        const p1 = y / h;
        const p2 = (y - h) / h;
        const p3 = (y - 2 * h) / h;

        if (x > (1 - p1) * size / 2 && x - 3 / 2 * size < p1 * size / 2 && x > p2 * size / 2 && x - 3 / 2 * size < (1 - p2) * size / 2 && y < 2 * h)
            return colorH;
        else if (x - 5 / 2 * size > (1 - p2) * size / 2 && x - 4 * size < p2 * size / 2 && x - 5 / 2 * size > p3 * size / 2 && x - 4 * size < (1 - p3) * size / 2 && y >= h)
            return colorH;
        else if (x - 5 * size > (1 - p3) * size / 2 && x - 6.5 * size < p3 * size / 2 && y >= 2 * h || x - 4.5 * size > p1 * size / 2 && x - 6 * size < (1 - p1) * size / 2 && y < h)
            return colorH;
        else
            return texture_triangleTiling({size: size, colors: [colorT1, colorT2]})(x + size / 2, y);
    };
}

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
    const colorT = dict['color1']   || colors[0] || texture_solid({ colors: [COLORS.cyan] });
    const colorH = dict['color2']   || colors[1] || texture_solid({ colors: [COLORS.orange] });

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;
        const offset = get_offset(j, 4 * h, 0.5, size);

        const [x, y] = ij2xy(i + offset, 2 * size, j, h);

        const p = j % (2 * h) > h ? y / h : 1 - y / h;
        if (x > p * size / 2 && (i + offset) % (2 * size) < (2 - p / 2) * size)
            return colorH;
        else
            return colorT;
    };
}

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
    const color1 = dict['color1']   || colors[0] || COLORS.cyan;
    const color2 = dict['color2']   || colors[1] || COLORS.orange;

    return function (i, j) {
        const size_x = width / columns;
        const size_y = height / rows;

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
}

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

    const row = dict['rows']       || 75
    const column = dict['columns']  || 75
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.green;
    const color3 = dict['color3']   || colors[2] || COLORS.red;

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
        if (value <= 1/3)   return color1; 
        else if (value <= 2/3)  return color2; 
        else return color3; 

            // Enable infinite choice of colors (Maybe one day fix)
        //return Math.floor(value / ([1, 2, 3].map((x) => 1 / x))[colors.length - 1]);
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
        return get_Colors(value);
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


/* Texture : Voroinoï diagram 
 *
 * @param nb_case  Number of germs in Voronoï diagram
 * @param height canvas height
 * @param i number of lines skipped
 * @param j number of columns skipped
 * @param (x,y) coordinates of the pixel
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_Voronoi(dict) {

    const width = dict['width']     || WIDTH;
    const height = dict['height']   || HEIGHT;
    const nb_case = dict['germs']   || 10;
    const colors = dict['colors']   || [COLORS.black, COLORS.red]

    let width_colors = new Array(); 
    const width_case = 4; 
    for(let i=0; i<colors.length; i++)
    {
       width_colors[i] = width_case * i; 
    }

    let stock_germs = {};
    for (let i = 0; i < nb_case; i++) {
        stock_germs[i] = [getRandomInt(width), getRandomInt(height)];
    }

    // Return indice of the minest one (min[0]) and the second minest one (min[1])
    function get_two_closest(x, y) {
        let min = [0, 0];
        let gx = 0;
        let gy = 0;
        
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
        return Math.abs(scalar_x + scalar_y);
    }

    // Return a color depending of the value and the colors permited
    function get_Colors(dist, width_colors, colors) {
        for(let i=1; i<width_colors.length; i++)
        {
            if (dist <= width_colors[i]) return colors[i]; 
        }

        return undefined; 
    }


    // Voronoï calcul for (x, y) coordinate 
    return (x, y) => {
        let min = get_two_closest(x, y);

        let gx_1 = stock_germs[min[0]][0];
        let gy_1 = stock_germs[min[0]][1];
        let dist_1 = distance(x, y, gx_1, gy_1);

        let gx_2 = stock_germs[min[1]][0];
        let gy_2 = stock_germs[min[1]][1];

        // It's a GERM 
        let r = 4;
        if (dist_1 <= r) return [0, 0, 255, 255]; //colors.blue;

        let dist_smooth = distance_smooth(x, y, gx_1, gy_1, gx_2, gy_2); 
        let color = get_Colors(dist_smooth, width_colors, colors);

        if (color === undefined) return colors[0]; 
        else return color; 

    };
}

/* Returns all neighboors of a cell, using the Moore specification.
 * 
 * @param grid the cellular automata grid
 * @param cell a cell {i,j}
 *
 * @return the Moore neighboors array
 */
function getMooreNeighborsState(grid, cell)
{
    const width = grid.length;
    const height = grid[0].length;
    
    let neighs = [];

    /* 
     * Testing neighboors in this specific order :
     *
     * 1  2  3
     * 4  x  5
     * 6  7  8
     *
     */
    
    if (cell.j - 1 >= 0)
    {
        if (cell.i - 1 >= 0) neighs.push(grid[cell.i - 1][cell.j - 1]);
        neighs.push(grid[cell.i][cell.j - 1]);
        if (cell.i + 1 < width) neighs.push(grid[cell.i + 1][cell.j - 1]);
    }

    if (cell.i - 1 >= 0) neighs.push(grid[cell.i - 1][cell.j]);
    if (cell.i + 1 < width) neighs.push(grid[cell.i + 1][cell.j]);
    
    if (cell.j + 1 < height)
    {
        if (cell.i - 1 >= 0) neighs.push(grid[cell.i - 1][cell.j + 1]);
        neighs.push(grid[cell.i][cell.j + 1]);
        if (cell.i + 1 < width) neighs.push(grid[cell.i + 1][cell.j + 1]);
    }    

    return neighs;
}

/* Returns the next step of a forestFire cellular automaton.
 *
 * @param forest the forest grid
 * @param treeP the tree spawning probability
 * @param lightP the lightning striking probability
 *
 * @return the next cellular automata grid
 */
function forestFire_nextStep(forest, treeP, lightP)
{
    let nextForest = [];
    
    for (let i = 0; i < forest.length; ++i)
    {
        nextForest[i]  = []; 
        for (let j = 0; j < forest[0].length; ++j)
        {
            if (forest[i][j] === 2) // Burning : transform into an empty cell
            {
                nextForest[i][j] = 0;
            } else if (forest[i][j] === 1) // Tree : tranform into a burning cell or do nothing
            {    
                let neighborsState = getMooreNeighborsState(forest, {i:i, j:j}).sort();
                if (neighborsState[neighborsState.length - 1] === 2) // has at least one neighbor burning
                {
                    nextForest[i][j] = 2;
                } else {
                    nextForest[i][j] = (getRandomInt(100) < lightP) ? 2 : 1;
                }
            } else // forest[i][j] === 0 - Empty : transform into a tree cell or do nothing
            {
                nextForest[i][j] = (getRandomInt(100) < treeP) ? 1 : 0;
            }
        }
    }

    return nextForest;
}

/* Texture : forestFire
 *
 * @param dict.width    canvas width
 * @param dict.height   canvas height
 * @param dict.treeP    tree spawning probability
 * @param dict.lightP   lightning striking probability
 * @param dict.step     step number
 *
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_forestFire(dict) {
    const width =                dict['width']  || WIDTH;
    const height =               dict['height'] || HEIGHT;
    const treeProbability =      dict['treeP']  || 50;
    const lightningProbability = dict['lightP'] || 5;
    const steps =                dict['step']   || 30;
    
    // The forest is represented by :
    //   * 0 : Empty
    //   * 1 : Tree
    //   * 2 : Burning
    let forest = [];

    for (let i = 0; i < width; ++i)
    {
        forest[i] = [];
        for (let j = 0; j < height; ++j)
        {
            forest[i][j] = (getRandomInt(100) < treeProbability) ? 1 : 0;
        }
    }

    for (let k = 0; k < steps; ++k)
    {
        forest = forestFire_nextStep(forest, treeProbability, lightningProbability);
    }
    
    return (x,y) => {
        if (forest[x][y] === 0) // Empty
        {
            return COLORS.black;
        } else if (forest[x][y] === 1) // Tree
        {
            return COLORS.green;
        } else // Burning 
        {
            return COLORS.red;
        }
    };
}

/* Returns the next step of a gameOfLife cellular automaton.
 *
 * @param grid the game of Life grid
 *
 * @return the next cellular automata grid
 */
function gameOfLife_nextStep(grid)
{
    let nextGrid = [];
    
    for (let i = 0; i < grid.length; i++)
    {
        nextGrid[i]  = []; 
        for (let j = 0; j < grid[0].length; j++)
        {
            const aliveNeighbors = getMooreNeighborsState(grid, {i:i, j:j}).reduce((acc, el) => acc += el, 0);
            
            if (grid[i][j] === 0) // Dead
            {
                nextGrid[i][j] = (aliveNeighbors === 3) ? 1 : 0;
            }
            else // Alive
            {
                nextGrid[i][j] = (aliveNeighbors === 2 || aliveNeighbors === 3) ? 1 : 0;
            }
        }
    }

    return nextGrid;
}


/* Texture : gameOfLife
 *
 * @param dict.width    canvas width
 * @param dict.height   canvas height
 * @param dict.step     step number
 *
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_gameOfLife(dict) {
    const width =  dict['width']  || WIDTH;
    const height = dict['height'] || HEIGHT;
    const steps =  dict['step']   || 1;
    
    // The grid is represented by :
    //   * 0 : Dead
    //   * 1 : Alive
    let grid = [];

    for (let i = 0; i < width; ++i)
    {
        grid[i] = [];
        for (let j = 0; j < height; ++j)
        {
            grid[i][j] = (getRandomInt(100) < 40) ? 1 : 0; // 40% Alive cells
        }
    }
    
    for (let k = 0; k < steps; ++k)
    {
        grid = gameOfLife_nextStep(grid);
    }
    
    return (x,y) => {
        if (grid[x][y] === 0) // Dead
        {
            return COLORS.white;
        } else // Alive
        {
            return COLORS.black;
        }
    };
}

function Greenberg_Hastings_nextstep(grid)
{
    let new_grid = []; 

        // Initialization new_grid 
    for(let i=0; i < grid.length; i++)
    {
        new_grid[i] = []; 
        for(let j=0; j < grid[0].length; j++)
        {
            new_grid[i][j] = grid[i][j]; 
        }
    }
    
    function excited_neighboor(grid, i, j)
    {
        for(let ni = -1; ni < 2; ni += 2)
        {
            let pos_x = i+ni; 
            if (pos_x < 0 || pos_x >= grid.length)  continue;
            
                // Excited state
            if (grid[pos_x][j] === 0) return true; 
        }
        
        for(let nj = -1; nj < 2; nj += 2)
        {
            let pos_y = j+nj;
            if (pos_y < 0 || pos_y >= grid[0].length)  continue;
            
                // Excited state
            if (grid[i][pos_y] === 0) return true; 
        }
        

        return false;
    }

        // Update grid
    for(let i=0; i < grid.length; i++)
    {
        for(let j=0; j < grid[0].length; j++)
        {
                // Excited & Refractory state
            if (grid[i][j] === 0 || grid[i][j] === 1)
            {
                new_grid[i][j] = grid[i][j] + 1; 
            }
            else
            {
                if (excited_neighboor(grid, i, j))
                {
                    new_grid[i][j] = 0; 
                }
            }
        }
    }
    

    return new_grid; 
}

/* Texture : Greenberg_Hastings
 *
 * @param dict.width    canvas width
 * @param dict.height   canvas height
 * @param dict.step     step number
 * @param dict.colors   colors used
 *
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_Greenberg_Hastings(dict)
{
    const width =  dict['width']    || WIDTH;
    const height = dict['height']   || HEIGHT;
    const step = dict['step']       || 50; 
    const colors = dict['colors']   || [COLORS.red, COLORS.blue, COLORS.green]; 

        // Greenberg-Hastings
    // 0 : Excited time (Red)
    // 1 : Refractory time  (Yellow)
    // 2 : Resting time    (Green)

    let grid = []; 

    
        // Initialization grid 
    for(let i=0; i < width; ++i)
    {
        grid[i] = []; 
        for(let j = 0; j < height; ++j)
        {
            grid[i][j] = 2; 
        }
    }
    
        // Spicy game
    // ================================
    
    // Double line
    const size_line = 10;
    const random_x  = getRandomInt(width-30);
    const random_y = getRandomInt(height-30); 
    for(let r=0; r<size_line; r++)
    {
        let ri = random_x + r;
        let rj_1 = random_y;
        let rj_2 = random_y + 1;

        grid[ri][rj_1] = 1; 
        grid[ri][rj_2] = 0; 
    }

    // ================================

        // Running the game
    for(let k=0; k < step; k++)
    {
        grid = Greenberg_Hastings_nextstep(grid); 
    }


    return (x, y) => {
        return colors[grid[x][y]]; 
    }
}

// Used to select a initialization setup and a next step rule for the tree generator
function getRule(rule)
{
    switch(rule)
    {
        case "73": return [rule73_initGrid, rule73_nextState];
        case "73_rng": return [ruleDef_initGrid, rule73_nextState];
        case "90": return [rule90_initGrid, rule90_nextState];
        case "90_rng": return [ruleDef_initGrid, rule90_nextState];
        case "110": return [rule110_initGrid, rule110_nextState];
        case "110_rng": return [ruleDef_initGrid, rule110_nextState];
        default: return [rule73_initGrid, rule73_nextState];;
    }
}
// Random initialization
function ruleDef_initGrid(grid)
{
    for (let i = 0; i < grid.length; ++i)
    {
        grid[i][0] = (getRandomInt(100) < 20) ? 1 : 0; // 20% On cells
    }
    return grid;
}

// Rule 110
function rule110_nextState(neighboors)
{
    switch(neighboors)
    {
        case "111": return 0;
        case "110": return 1;
        case "101": return 1;
        case "100": return 0;
        case "011": return 1;
        case "010": return 1;
        case "001": return 1;
        case "000": return 0;
        default : return 0;
    }
}
function rule110_initGrid(grid)
{
    grid[grid.length - 1][0] = 1;
    return grid;
}

// Rule 73
function rule73_nextState(neighboors)
{
    switch(neighboors)
    {
        case "111": return 0;
        case "110": return 1;
        case "101": return 0;
        case "100": return 0;
        case "011": return 1;
        case "010": return 0;
        case "001": return 0;
        case "000": return 1;
        default : return 0;
    }
}
function rule73_initGrid(grid)
{
    grid[Math.floor(grid.length/2)][0] = 1;
    return grid;
}

// Rule 90
function rule90_nextState(neighboors)
{
    switch(neighboors)
    {
        case "111": return 0;
        case "110": return 1;
        case "101": return 0;
        case "100": return 1;
        case "011": return 1;
        case "010": return 0;
        case "001": return 1;
        case "000": return 0;
        default : return 0;
    }
}
function rule90_initGrid(grid)
{
    grid[Math.floor(grid.length/2)][0] = 1;
    return grid;
}

/* Creates the elementary cellular automaton next step
 *
 * @param grid the actual grid
 * @param rule the defined rule
 * @param step the next line
 *
 * @return the next grid
 */
function elem_nextStep(grid, rule, step) {
    const width = grid.length;
    
    for (let i = 0; i < grid.length; ++i)
    {
        const left = (i === 0) ? grid[width - 1][step - 1] : grid[i - 1][step - 1];
        const middle = grid[i][step - 1];
        const right = (i === width - 1) ? grid[0][step - 1] : grid[i + 1][step - 1];

        const neighs = [left, middle, right].reduce((acc, el) => acc += el.toString(), "");
        grid[i][step] = rule(neighs);
    }
    return grid;
}

/* Texture : elementaryCellularAutomaton
 *
 * @param dict.width    canvas width
 * @param dict.height   canvas height
 * @param dict.rule     initialization setup and next step rule
 *
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_elementaryCellularAutomaton(dict) {
    const width =  dict['width']  || WIDTH;
    const height = dict['height'] || HEIGHT;
    const [init,rule] =   dict['rule'] || [ruleDef_initGrid, rule73_nextState];
    
    // The grid is represented by :
    //   * 0 : Off
    //   * 1 : On
    let grid = [];

    for (let i = 0; i < width; ++i)
    {
        grid[i] = [];
        for (let j = 0; j < height; ++j)
        {
            grid[i][j] = 0;
        }
    }
    
    grid = init(grid);
    
    for (let k = 1; k <= height; ++k)
    {
        grid = elem_nextStep(grid, rule, k);
    }
    
    return (x,y) => {
        if (grid[x][y] === 0) // Off
        {
            return COLORS.white;
        } else // On
        {
            return COLORS.black;
        }
    };
}


function texture_triangularFractal(dict) {
    const width_init = dict['width']    || 500;
    const height_init = dict['height']  || 500;
    const n = dict['depth']             || 5;
    const colors = dict['colors']       || [];
    const color = colors[0]             || dict['color1'] || COLORS.black;

    return function (i, j) {
        //const offset = 125;
        /*
        if (x + d / 2 > p * width / 2 && x - d / 2 < p * width / 2 && x < width / 2 && x >= - d / 2 && y <= height + d / 2
                || x - width / 2 - d / 2 < (1 - p) * width / 2 && x - width / 2 + d / 2 > (1 - p) * width / 2 && x >= width / 2 && x <= width + d / 2 && y <= height + d / 2
                || x >= 0 &&  x <= width && y >= height - d / 2 && y <= height + d / 2)
        */
        function triangle(width, height, x_offset, y_offset) {
            const x = i - x_offset;
            const y = j - y_offset;
            const p1 = 1 - y / (height / 2);
            const p2 = 1 - (y - height / 2) / (height / 2);
            if (width < width_init / (2 ** (n - 1)) || height < height_init / (2 ** (n - 1)))
                return color;
            if (x - width / 4 >= p1 * width / 4 && x - width / 2 <= (1 - p1) * width / 4 && y <= height / 2)
                return triangle(width / 2, height / 2, x_offset + width / 4, y_offset);
            if (x >= p2 * width / 4 && x - width / 4 <= (1 - p2) * width / 4 && y >= height / 2 && y <= height)
                return triangle(width / 2, height / 2, x_offset, y_offset + height / 2);
            if (x - width / 2 >= p2 * width / 4 && x - 3 * width / 4 <= (1 - p2) * width / 4 && y >= height / 2 && y <= height)
                return triangle(width / 2, height / 2, x_offset + width / 2, y_offset + height / 2);
            return COLORS.white;
            }
        return triangle(width_init, height_init, 0, 0);
    };
}

function texture_squareFractal(dict) {

   const width_init = dict['width']    || WIDTH;
   const height_init = dict['height']  || HEIGHT;
   const n = dict['depth']             || 3;
   const colors = dict['colors']       || [];
   const color1 = colors[0]            || dict['color1'] || COLORS.black;
   const color2 = colors[1]            || dict['color2'] || COLORS.white;

   return function(x, y) {
      
      function square(width, height, x_offset, y_offset, lvl) {

         let x_newoffset = x_offset;
         let y_newoffset = y_offset;
         let i = x - x_offset;
         let j = y - y_offset;
         let midx = false, midy = false;

         if(i < width/(3))            x_newoffset += 0;
         else if(i > (2*width)/(3))   x_newoffset += 2*(width/3);
         else {
            x_newoffset += width/3;
            midx = true;
         }                         

         if(j < height/(3))           y_newoffset += 0;
         else if(j > (2*height)/(3))  y_newoffset += 2*(height/3);
         else {
            y_newoffset += height/3;
            midy = true;
         }

         if(midx && midy) return color2;
         else if(lvl > 0) {
            return square(width/(3), height/(3), x_newoffset, y_newoffset, lvl-1);
         } else {
            return color1;
         }
      }

      return square(width_init, height_init, 0, 0, n-1);
   };

}

function colorFromDist(color, dist, size, func) {
    return func([color[0], color[1], color[2], color[3]], dist, size);
}

function distTexture_triangleTiling(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;
    const func = dict['function']   || ((array, dist, size) => [array[0], array[1], array[2], array[3] * dist / size]);
    
    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;

        const offset = get_offset(j, 2 * h, 0.5, size / 2);

        const [x, y] = ij2xy((i + offset), size, j, h);
        const p = y / h;

        const dist1 = Math.abs(x - p * size / 2);
        const dist2 = Math.abs(x - (2 - p) * size / 2);
        const dist3 = y > h / 2 ? h - y : y;
        const dist = Math.min(dist1, dist2, dist3);

        const realcolor1 = colorFromDist(color1, dist, h * 1 / 3, func);
        const realcolor2 = colorFromDist(color2, dist, h * 1 / 3, func);
        if (x > p * size / 2 && x - size / 2 < (1 - p) * size / 2)
            return realcolor1;
        else
            return realcolor2;
    };
}

function distTexture_hexagonTiling(dict) {

    const size = dict['size']       || 80;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.cyan;
    const color2 = dict['color2']   || colors[1] || COLORS.orange;
    const color3 = dict['color3']   || colors[2] || COLORS.blue;
    const func = dict['function']   || ((array, dist, size) => [array[0], array[1], array[2], array[3] * dist / size]);

    return function (i, j) {
        const h = Math.sqrt(3) * size / 2;

        const offset = get_offset(i, 3 * size, 0.5, h);
        const [x, y] = ij2xy(i, 3 * size / 2, (j + offset), 2 * h);

        const cond1 = (j + 3 * offset) % (6 * h) > 2 * h;
        const cond2 = (j + 3 * offset) % (6 * h) > 4 * h;

        const p1 = 1 - y / h;
        const p2 = (y - h) / h;

        const dist1 = Math.abs(x - p1 * size / 2);
        const dist2 = Math.abs(x - p2 * size / 2);
        const dist3 = Math.abs(x - 3 * size / 2 - (1 - p1) * size / 2);
        const dist4 = Math.abs(x - 3 * size / 2 - (1 - p2) * size / 2);
        const dist5 = x > size / 2 ? y > h ? 2 * h - y : y : h;
        const dist = Math.min(dist1, dist2, dist3, dist4, dist5);

        const realcolor1 = colorFromDist(cond1 ? cond2 ? color3 : color2 : color1, dist, h / 2, func);
        const realcolor2 = colorFromDist(cond1 ? cond2 ? color1 : color3 : color2, dist, h / 2, func);
        const realcolor3 = colorFromDist(cond1 ? cond2 ? color2 : color1 : color3, dist, h / 2, func);

        if (x > p1 * size / 2 && x > p2 * size / 2)
            return realcolor1;
        else if (y < h)
            return realcolor2;
        else
            return realcolor3;
    };
}

function distTexture_squareTiling(dict) {

    const width = dict['width']     || WIDTH;
    const height = dict['height']   || HEIGHT;
    const rows = dict['rows']       || 5;
    const columns = dict['columns'] || 5;
    const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.cyan;
    const color2 = dict['color2']   || colors[1] || COLORS.orange;
    const func = dict['function']   || ((array, dist, size) => [array[0], array[1], array[2], array[3] * dist / size]);

    return function (i, j) {
        const size_x = width / columns;
        const size_y = height / rows;

        const [x, y] = ij2xy(i, 2 * size_x, j, 2 * size_y);

        const dist1 = Math.abs(x);
        const dist2 = Math.abs(x - size_x);
        const dist3 = Math.abs(x - 2 * size_x);
        const dist4 = Math.abs(y);
        const dist5 = Math.abs(y - size_y);
        const dist6 = Math.abs(y - 2 * size_y);
        const dist = Math.min(dist1, dist2, dist3, dist4, dist5, dist6);

        const realcolor1 = colorFromDist(color1, dist, Math.min(size_x, size_y) / 2, func);
        const realcolor2 = colorFromDist(color2, dist, Math.min(size_x, size_y) / 2, func);

        if (y < size_y) {
            if (x < size_x)
                return realcolor1;
            else
                return realcolor2;
        } else {
            if (x < size_x)
                return realcolor2;
            else
                return realcolor1;
        }
    };
}
