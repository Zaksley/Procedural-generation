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
 * @precond canvas must be a <canvas> html element
 * @return an image data array (of size width*height*4)
 */
function generateTexture(canvas, texture) {
    // Environnment definition
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);

    // Texture application
    for (let n = 0, y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++, n += 4) {
            
            let pixel = texture(x, y);
            while (typeof (pixel) === 'function')
                pixel = pixel(x, y);

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
    generateTexture(CANVAS, texture_star({n: 10}));

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
