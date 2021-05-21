'use strict';

// Global Variables
const globalVars = require('./vars.js');
let COLORS = globalVars.COLORS;
const VERBOSE = false;

// Textures
const basic_textures = require('./textures/basic_textures.js');
const regular_tilings_textures = require('./textures/regular_tilings_textures.js');
const semiregular_tilings_textures = require('./textures/semiregular_tilings_textures.js');
const polygon_tilings_textures = require('./textures/polygon_tilings_textures.js');
const noise_textures = require('./textures/noise_textures.js');
const cellular_automata_textures = require('./textures/cellular_automata_textures.js');
const distance_textures = require('./textures/distance_textures.js');
const signed_distance_textures = require('./textures/signed_distance_textures.js');
const fractal_textures = require('./textures/fractal_textures.js');
const shape_textures = require('./textures/shape_textures.js');
const TEXTURES = Object.assign({}, basic_textures, regular_tilings_textures, semiregular_tilings_textures, polygon_tilings_textures, noise_textures, cellular_automata_textures, distance_textures, signed_distance_textures, fractal_textures, shape_textures);

let textures_func = [];
for (let key in TEXTURES) {
    if (TEXTURES[key].name.substring(0, 8) === "texture_")
        textures_func.push(TEXTURES[key].name.substring(8));
}

// Filters
const basic_filters = require('./filters/basic_filters.js');
const composition_filters = require('./filters/composition_filters.js');
const convolution_filters = require('./filters/convolution_filters.js');
const color_filters = require('./filters/color_filters.js');
const deformation_filters = require('./filters/deformation_filters.js');
const FILTERS = Object.assign({}, basic_filters, composition_filters, convolution_filters, color_filters, deformation_filters);

let filters_func = [];
let doublefilters_func = [];
for (let key in FILTERS) {
    if (FILTERS[key].name.substring(0, 7) === "filter_")
        filters_func.push(FILTERS[key].name.substring(7));
    if (FILTERS[key].name.substring(0, 8) === "dfilter_")
        doublefilters_func.push(FILTERS[key].name.substring(8));
}

// Animation
const animations = require('./animations.js');
const ANIMATIONS = Object.assign({}, animations);

// Helpers
const getRule = cellular_automata_textures.getRule;

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
function generateTexture(canvas, texture, xOffset = 0, yOffset = 0) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);

    // Texture application
    for (let n = 0, y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++ , n += 4) {

            // Texture
            let pixel = texture(x + xOffset, y + yOffset);
            while (typeof (pixel) === 'function') {
                pixel = pixel(x + xOffset, y + yOffset);
            }

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
            for (let x = 0; x < canvas.width; x++ , n += 4) {
                let pixel = texture(x, y, dt);
                while (typeof (pixel) === 'function')
                    pixel = pixel(x, y, dt);

                image.data[n] = pixel[0]; // Red channel
                image.data[n + 1] = pixel[1]; // Green channel
                image.data[n + 2] = pixel[2]; // Blue channel
                image.data[n + 3] = pixel[3]; // Alpha channel
            }
        }

        if (!window.ANIMATION) {
            return;
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

/* Returns a color from its name
 *
 * @param color the color name
 * @return a color 4-array
 */
function getColor(color) {
    switch (color) {
        // Base colors
        case "0":       return [0, 0, 0, 0];
        case "white":   return COLORS.white;
        case "black":   return COLORS.black;
        case "grey":    return COLORS.grey;
        case "silver":  return COLORS.silver;
        case "blue":    return COLORS.blue;
        case "red":     return COLORS.red;
        case "green":   return COLORS.green;

        // Advanced colors
        case "orange":  return COLORS.orange;
        case "cyan":    return COLORS.cyan;
        case "pink":    return COLORS.pink;
        default:        return COLORS.black;
    }
}

/* Generates an image array from a json dictionnary
 * (Used in both HTML & Node generation functions)
 *
 * @param jsondata a json dictionnary with function names/parameters
 * @return an image array
 */
function generateArrayFromJson(canvas, jsondata) {

    /* Recursive function building a dictionnary for the current filter/texture
     *
     * @param dict the dictionnary to explore
     * @param paramsOnly true if the function only searches for parameters (no filters/textures)
     * @param searchModel searchs for or returns a second texture (see below)
     * @return if searchModel === "--search" then returns texture name, else returns parameters dictionnary
     */
    function generateLevel(dict, paramsOnly = false, searchModel = "") {
        /* searchModels :
         * "" : No texture searching
         * "--search" : Return first texture name found
         * other : Search for a texture except "other"
         */
        let levelArgs = {};

        for (let key in dict) {

            // The key is a duplicate texture function
            if (paramsOnly === false && key.substring(0, 4) === "dup_" && searchModel !== key) {
                if (VERBOSE === true) 
                    console.log("FOUND TEXTURE " + key);
                if (searchModel === "--search") 
                    return key;
                return generateTexture(canvas, TEXTURES[key.substring(4)](generateLevel(dict[key])));
            }

            // The key is a texture function
            else if (paramsOnly === false && textures_func.includes(key) && searchModel !== key) {
                if (VERBOSE === true) 
                    console.log("FOUND TEXTURE " + key);
                if (searchModel === "--search") 
                    return key;
                return generateTexture(canvas, TEXTURES[key](generateLevel(dict[key])));
            }

            // The key is a 1-image filter
            else if (paramsOnly === false && filters_func.includes(key) && searchModel !== key) {
                if (VERBOSE === true) 
                    console.log("FOUND FILTER " + key);
                if (searchModel === "--search") 
                    return key;
                return FILTERS[key](generateLevel(dict[key], true))(generateLevel(dict[key], false));
            }

            // The key is a 2-image filter
            else if (paramsOnly === false && doublefilters_func.includes(key) && searchModel !== key) {
                if (VERBOSE === true) 
                    console.log("FOUND COMPOSING FILTER " + key);
                if (searchModel === "--search") 
                    return key;
                const firstImg = generateLevel(dict[key], false, "--search");
                const param1 = generateLevel(dict[key], false);
                const param2 = generateLevel(dict[key], false, firstImg);
                return FILTERS[key](generateLevel(dict[key], true))(param1, param2);
            }

            // The key is a parameter
            //if(params.includes(key)){
            else {
                if (VERBOSE === true) 
                    console.log("FOUND PARAMETER " + key);
                let value = dict[key];
                // A known color is found
                if (key.substring(0, 5) === "color" && (typeof dict[key] === "string"))
                    value = getColor(dict[key]);
                // A subfunction is called as a color parameter
                if (key.substring(0, 5) === "color" && (typeof dict[key] === "object" && !Array.isArray(dict[key]))) {
                    if (VERBOSE === true) 
                        console.log("FOUND COMPLEX COLOR");
                    for (let subkey in dict[key]) {
                        if (VERBOSE === true) 
                            console.log(subkey);
                        if (textures_func.includes(subkey))
                            value = TEXTURES[subkey](generateLevel(dict[key][subkey]));
                        else if (filters_func.includes(subkey))
                            value = FILTERS[subkey](generateLevel(dict[key][subkey], true))(generateLevel(dict[key][subkey], false));
                    }
                }
                // A known rule is found
                if (key.substring(0, 4) === "rule" && !Array.isArray(dict[key]))
                    value = getRule(dict[key]);

                levelArgs[key] = value;
                continue;
            }
        }
        return levelArgs;
    }
    return generateLevel(jsondata);
}


// Exports
exports.generateTexture         = generateTexture;
exports.generateAnimation       = generateAnimation;
exports.generateImage           = generateImage;
exports.generateArrayFromJson   = generateArrayFromJson;
exports.getRule                 = getRule;
exports.TEXTURES                = TEXTURES;
exports.FILTERS                 = FILTERS;
exports.ANIMATIONS              = ANIMATIONS;
exports.textures_func           = textures_func;
exports.filters_func            = filters_func;
exports.doublefilters_func      = doublefilters_func;