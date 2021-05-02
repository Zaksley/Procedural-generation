'use strict';

// Global variables
let MAX_ARGUMENTS = 50;
const WIDTH = 500, HEIGHT = 500;
let CANVAS = document.getElementById('canvas');
CANVAS.width = WIDTH; CANVAS.height = HEIGHT;
// /!\ UNUSED
//let CONTEXT = CANVAS.getContext("2d");
//let IMAGE = CONTEXT.createImageData(CANVAS.width, CANVAS.height);

//////// MAIN FUNCTIONS ///////////

/* Generates an image data array from a texture function
 *
 * @param canvas the canvas used for sizing
 * @param texture a texture function to generate
 * @param xOffset x-offset of the texture in pixels
 * @param yOffset y-offset of the texture in pixels
 * @precond canvas must be a <canvas> html element
 * @return an image data array (of size width*height*4)
 */
function generateTexture(canvas, texture, xOffset=0, yOffset=0) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);

    // Texture application
    for (let n = 0, y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++, n += 4) {
            
            let pixel = texture(x+xOffset, y+yOffset);
            while (typeof (pixel) === 'function')
                pixel = pixel(x+xOffset, y+yOffset);

            image.data[n] = pixel[0]; // Red channel
            image.data[n + 1] = pixel[1]; // Green channel
            image.data[n + 2] = pixel[2]; // Blue channel
            image.data[n + 3] = pixel[3]; // Alpha channel
        }
    }

    return image.data;
}

/* Generates an animation from a texture function
 *
 * @param canvas the canvas used for sizing
 * @param texture a texture function to generate
 * @param ...args a list of arguments for the texture function
 * @precond canvas must be a <canvas> html element
 * @return nothing
 */
function generateAnimation(canvas, texture) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);

    makeFrame(); // Start the animation

    /* Creates an animation on main canvas
     *
     * @param time timestamp of current image
     * @return nothing
     */
    function makeFrame(time) {
        let dt = 0.005 * time;
        for (let n = 0, y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++, n += 4) {
                let pixel = texture(x, y, dt);
                while (typeof (pixel) === 'function')
                    pixel = pixel(x, y, dt);

                image.data[n] = pixel[0]; // Red channel
                image.data[n + 1] = pixel[1]; // Green channel
                image.data[n + 2] = pixel[2]; // Blue channel
                image.data[n + 3] = pixel[3]; // Alpha channel
            }
        }

        context.putImageData(image, 0, 0); requestAnimationFrame(makeFrame);
    }
}

/* OUTDATED Generates an image data array from a texture function
 *
 * @param canvas the canvas used for sizing
 * @param texture a texture function to generate
 * @param ...args a list of arguments for the texture function
 * @precond canvas must be a <canvas> html element
 * @return an image data array (of size width*height*4)
 */
function generateTextureOld(canvas, texture, ...args) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);

    // Texture function definition
    let nbArgs = 0;
    let textureFunction = texture;
    while (typeof (textureFunction) === 'function' && nbArgs <= MAX_ARGUMENTS) {
        // Verifies that next argument is not the last block
        if (typeof (textureFunction(args[0])) === 'function') {
            textureFunction = textureFunction(args[0]);
        }
        args.shift();
        nbArgs++;
    }

    // Texture application
    for (let n = 0, y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++, n += 4) {
            let pixel = textureFunction(x, y);
            image.data[n] = pixel[0]; // Red channel
            image.data[n + 1] = pixel[1]; // Green channel
            image.data[n + 2] = pixel[2]; // Blue channel
            image.data[n + 3] = pixel[3]; // Alpha channel
        }
    }

    return image.data;
}

/* OUTDATED Generates an animation from a texture function
 *
 * @param canvas the canvas used for sizing
 * @param texture a texture function to generate
 * @param ...args a list of arguments for the texture function
 * @precond canvas must be a <canvas> html element
 * @return nothing
 */
function generateAnimationOld(canvas, texture, ...args) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);

    // Texture function definition
    let nbArgs = 0;
    let textureFunction = texture;

    while (typeof (textureFunction) === 'function' && nbArgs <= MAX_ARGUMENTS) {
        // Verifies that next argument is not the last block
        if (typeof (textureFunction(args[0])) === 'function') {
            textureFunction = textureFunction(args[0]);
        }
        args.shift();
        nbArgs++;
    }

    makeFrame(); // Start the animation

    /* Creates an animation on main canvas
     *
     * @param time timestamp of current image
     * @return nothing
     */
    function makeFrame(time) {
        let dt = 0.005 * time;
        for (let n = 0, y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++, n += 4) {
                let pixel = textureFunction(x, y, dt);
                image.data[n] = pixel[0]; // Red channel
                image.data[n + 1] = pixel[1]; // Green channel
                image.data[n + 2] = pixel[2]; // Blue channel
                image.data[n + 3] = pixel[3]; // Alpha channel
            }
        }

        context.putImageData(image, 0, 0); requestAnimationFrame(makeFrame);
    }
}

/* Prints an image on a canvas
 *
 * @param canvas the canvas for the image to be printed on
 * @param data an image data array
 * @precond canvas must be a <canvas> html element
 * @precond data must be of size (canvas.width)*(canvas.height)*4 
 * @return nothing
 */
function generateImage(canvas, data) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);

    for (let i = 0; i < image.data.length; i++) image.data[i] = data[i];
    context.putImageData(image, 0, 0);
}

/* Generates an image array from a json dictionnary
 * (Used in both HTML & Node generation functions)
 *
 * @param jsondata a json dictionnary with function names/parameters
 * @return an image array
 */
function generateArrayFromJson(jsondata) {

    // Texture functions
    let textures_func = ["horizontalGradient",
        "solid", "hexagonTiling", "triangleTiling","caireTiling","pentagonTiling3",
        "3Dcube","3DgambarTiling","elongatedTriangular","snubSquare","snubHexagonal",
        "truncatedSquare","truncatedHexagon","smallRhombitrihexagonalTiling",
        "bigRhombitrihexagonalTiling","trihexagonal","squareTiling","limitedWhiteNoise",
        "whiteNoise","Voronoi","forestFire","gameOfLife","elementaryCellularAutomaton","triangularFractal","squareFractal",
        "star","doubleStar","regularShape", "Greenberg_Hastings"];
    // One-texture filters
    let filters_func = ["rotation","horizontalFlip","verticalFlip","invertColor","blur",
    "filter_detectOutline","grayScale","getRGBChannel","getHSLChannel","sobel","canny",
    "sharpness","box_blur","gaussian_blur","gaussian_unsharp_masking","unsharp_masking",
    "luminosity","saturation","contrast","hueShift","resize"];

    // Two-textures filters
    let doublefilters_func = ["compose"];

    // Textures & filters parameters
    let params = ["size","size2","angle","columns","rows","treepP","lightP","step","germs","branches",
    "depth","centerx","centery","radius","stdev","intensity","c","color1","color2","color3","color4",
    "operation","rule"];

    /* Recursive function building a dictionnary for the current filter/texture
     *
     * @param dict the dictionnary to explore
     * @param paramsOnly true if the function only searches for parameters (no filters/textures)
     * @param searchModel searchs for or returns a second texture (see below)
     * @return if searchModel === "--search" then returns texture name, else returns parameters dictionnary
     */
    function generateLevel(dict, paramsOnly=false, searchModel="") {
        /* searchModels :
         * "" : No texture searching
         * "--search" : Return first texture name found
         * other : Search for a texture except "other"
         */
        let levelArgs = {};

        for(let key in dict) {

            // The key is a parameter
            if(params.includes(key)){
                console.log("FOUND PARAMETER " + key);
                let value = dict[key];
                // A known color is found
                if(key.substring(0,5) === "color" && !Array.isArray(dict[key])){
                    value = getColor(dict[key]);
                }
                if(key.substring(0,4) === "rule" && !Array.isArray(dict[key])){
                    value = getRule(dict[key]);
                }
                levelArgs[key] = value;
                continue;
            }

            // The key is a texture function
            if(paramsOnly === false && textures_func.includes(key) && searchModel != key){
                //console.log("FOUND TEXTURE " + key);
                if(searchModel === "--search") return key;
                return generateTexture(CANVAS, window["texture_" + key](generateLevel(dict[key])));
            }

            // The key is a 1-image filter
            if(paramsOnly === false && filters_func.includes(key)){
                //console.log("FOUND FILTER " + key);
                return window["filter_" + key](generateLevel(dict[key], true))(generateLevel(dict[key], false));
            }

            // The key is a 2-image filter
            if(paramsOnly === false && doublefilters_func.includes(key)){
                //console.log("FOUND COMPOSING FILTER " + key);
                let firstImg = generateLevel(dict[key], false, "--search");
                return window["filter_" + key](generateLevel(dict[key], true))
                    (generateLevel(dict[key], false), generateLevel(dict[key], false, firstImg));
            }

            // Unrecognized key
            //else throw new Error("Invalid key (filter, texture or parameter not recognized).");
        }
        return levelArgs;
    }
    return generateLevel(jsondata);
}


/*
exports.generateTexture = generateTexture;
exports.generateImage = generateImage;
exports.generateAnimation = generateAnimation;
//exports.colors = colors;
*/
///////// TESTS //////////

// ========== TEXTURE (only one) ==========
// Usage : let data = generateTexture(CANVAS, [texture], <...args>);*/
let data =
    //generateTexture(CANVAS, texture_horizontalColorGradients, WIDTH, 2, colors.orange, colors.cyan);
    //generateTexture(CANVAS, texture_squareTiling, WIDTH, HEIGHT, 8, 12, colors.orange, colors.blue);
    //generateTexture(CANVAS, texture_perlinNoise, 50, 50, 4, [colors.black, colors.green, colors.blue, colors.red]);
    //generateTexture(CANVAS, texture_trihexagonal, 25, colors.orange, colors.red);
    //generateTexture(CANVAS, texture_triangleTiling, 25, colors.orange, colors.blue);
    //generateTexture(CANVAS, texture_truncatedSquare, 25, colors.orange, colors.blue, colors.red);
    //generateTexture(CANVAS, texture_hexagonTiling, 20, colors.cyan, colors.orange, colors.blue);
    //generateTexture(CANVAS, texture_limitedWhiteNoise, CANVAS.width, CANVAS.height, 3, 2);
    //generateTexture(CANVAS, texture_Voronoi, 50, CANVAS.width, CANVAS.height);
    //generateTexture(CANVAS, texture_trihexagonal, 25, texture_horizontalColorGradients(25)(1)(colors.orange)(colors.red), texture_horizontalColorGradients(2*25)(1)(colors.blue)(colors.green));
    //generateTexture(CANVAS, texture_trihexagonal({size: 25, colors: [texture_horizontalGradient({width: WIDTH, n: 1, colors: [COLORS.blue, COLORS.green]}), texture_squareTiling({width: 2 * 25, height: 25 * Math.sqrt(3), rows: 4, columns: 4, colors: [COLORS.orange, COLORS.red]})]}));
    //generateTexture(CANVAS, texture_rhombitrihexagonalTiling, 25, colors.orange, colors.green, colors.blue);
    //generateTexture(CANVAS, texture_truncatedHexagon, 50 , colors.orange, colors.blue, colors.red, colors.green);
    //generateTexture(CANVAS, texture_elongatedTriangular, 50, colors.red, colors.blue, colors.green, colors.orange);
    //generateTexture(CANVAS, texture_snubSquare, 50, colors.red, colors.blue, colors.green);
    //generateTexture(CANVAS, texture_3Dcube, 100, colors.black, colors.grey, colors.white);
    //generateTexture(CANVAS, texture_caireTiling, 50, 90, colors.red, colors.blue, colors.green, colors.orange);
    //generateTexture(CANVAS, texture_horizontalGradient({width: WIDTH, n: 2, colors: [] }));
    //generateTexture(CANVAS, texture_solid({}));
    //generateTexture(CANVAS, texture_pentagonTiling4({}));
    //generateTexture(CANVAS, texture_3DgambarTiling({size: 50, colors: [texture_hexagonTiling({size: 20, colors: [COLORS.blue, COLORS.green, COLORS.grey]}), texture_caireTiling({size: 20}) ,texture_perlinNoise(6)(3)(4)([COLORS.black, COLORS.white, COLORS.red, COLORS.pink])]}));
    //generateTexture(CANVAS, texture_pentagonTiling3({}));
    //generateTexture(CANVAS, texture_doubleStar({branches: 4, color1: texture_doubleStar({branches: 4, size: 30, size2: 50, colors: [COLORS.grey, COLORS.red]})}));
    //generateTexture(CANVAS, texture_bigRhombitrihexagonalTiling({}));
    //generateTexture(CANVAS, texture_snubHexagonal({}));
    //generateTexture(CANVAS, distTexture_squareTiling({colors:[COLORS.orange, COLORS.silver], function: (array, dist, size) => array.map((x, i) => i === 3 ? 255 : x * (3 + Math.sin(dist / size * 10)) / 4)}));
    generateTexture(CANVAS, sdParabolaSegment({}));

// ========================================

// ===== FILTERS (repeat for successive filters) =====
// Usage : data = [filter](data)<...(args)>);

//data = filter_blur(data)(WIDTH)(HEIGHT)(10);
//data = filter_cyanColoration(data)(0.5);
//data = filter_rotation(data)(WIDTH)(25);
//data = filter_detectOutline(data)(WIDTH)(2)(20)(colors.black);
//data = filter_horizontalFlip(data)(WIDTH);
//data = filter_verticalFlip(data)(WIDTH);
//data = filter_invertColor(data);
// ===================================================

// !! Do not touch
generateImage(CANVAS, data);


//generateAnimation(CANVAS, chromatic_circle, 100, WIDTH/2, HEIGHT/2);
//generateAnimation(CANVAS, chromatic_circle, 100, WIDTH/2, HEIGHT/2);
//generateAnimation(CANVAS, animated_caireTiling, 50, 90, colors.red, colors.blue, colors.green, colors.orange);
//generateAnimation(CANVAS, yin_yang({colors: [add_animation({texture: texture_hexagonTiling({size: 20, colors: [yin_yang({radius: 50}), COLORS.green, COLORS.grey]}), function: [((x, dt) => x + 100 * (1 + Math.cos(0.1*dt))), ((y, dt) => y + 100 * (1 + Math.sin(0.1*dt)))]}), chromatic_circle({}), add_animation({function: circle({}), texture:animated_caireTiling({})})]}));
//generateAnimation(CANVAS, add_animation({function: translation({borders: [WIDTH, HEIGHT], x_speed: 25, y_speed: 10}), texture: add_animation({ texture: yin_yang({rotation: 1, colors: [chromatic_circle({radius: 500})]}), function: circle({}) }) }) );
//generateAnimation(CANVAS, add_animation({function: translation({borders: [WIDTH, HEIGHT], x_speed: 25, y_speed: 10}), texture: add_animation({ texture: yin_yang({ colors: [[50, 150, 50, 255]]}), function: rotation({angle: 90, borders: [WIDTH, HEIGHT], function: (x, dt) => x + 10 * dt}) }) }) );
//generateAnimation(CANVAS, add_animation({ function: [translation({borders: [WIDTH, HEIGHT], x_speed: 25, y_speed: 10}), rotation({angle: 90, borders: [WIDTH, HEIGHT], function: (x, dt) => x + 10 * dt})], texture: yin_yang({ colors: [[50, 150, 50, 255]]})  }) );
//generateAnimation(CANVAS, animated_GameOfLife({}));
//generateAnimation(CANVAS, animated_randomFunction());
//generateAnimation(CANVAS, animated_Greenberg_Hastings({}));
//generateAnimation(CANVAS, animated_rain({}));