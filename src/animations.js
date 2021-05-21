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

const getRandomInt = require('./textures/tools_for_textures.js').getRandomInt;
const globalVars = require('./vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;
const COLORS = globalVars.COLORS;
const Greenberg_Hastings_nextstep = TEXTURES.Greenberg_Hastings_nextstep;
const gameOfLife_nextStep = TEXTURES.gameOfLife_nextStep;
const forestFire_nextStep = TEXTURES.forestFire_nextStep;

function node(_val, _children) {
    return { val: _val, children: _children };
}

function nodeThaw(node) {
    node.children = node.children();
    return node;
}

/* Transformation : circle
 * 
 * @param dict.radius circle radius
 * @param dict.freq rotation frequency
 * @return a function (x, y, dt) returning an array of coordinates
 */
function circle(dict) {
    const r =       dict['radius']  || 100;
    const freq =    dict['freq']    || 25;

    return ((x, y, dt) => [x + r * Math.cos(Math.PI * 2 * dt / freq), y + r * Math.sin(Math.PI * 2 * dt / freq)]);
}

/* Transformation : rotation
 * 
 * @param dict.borders_rot canvas width and height
 * @param dict.center rotation center
 * @param dict.angle rotation starting angle
 * @param dict.function a function (angle, dt) returning an angle
 * @return a function (x, y, dt) returning an array of coordinates
 */
function rotation(dict) {
    const borders =     dict['borders']     || [];
    const width =       dict['width']       || borders[0] || 0;
    const height =      dict['height']      || borders[1] || 0;
    const center =      dict['center']      || [];
    const center_x =    dict['centerx']     || center[0] || width / 2;
    const center_y =    dict['centery']     || center[1] || height / 2;
    const angle =       dict['angle']       || 0;
    const func =        dict['function']    || ((angle, dt) => angle + 0 * dt);

    return function (x, y, dt) {
        if (width !== 0 && height !== 0 && angle % 360 !== 0) {
            const alpha = func(angle, dt) * Math.PI / 180;
            const x_init = x - center_x;
            const y_init = y - center_y;
            let r, angle_init;

            if (Math.abs(x_init) > Math.abs(y_init))
                r = Math.abs(x_init) * Math.sqrt(1 + y_init * y_init / (x_init * x_init));
            else
                r = Math.abs(y_init) * Math.sqrt(1 + x_init * x_init / (y_init * y_init));
            if (r === 0) {
                x = center_x;
                y = center_y;
            } else {
                if (y_init < 0)
                    angle_init = -Math.acos(x_init / r);
                else
                    angle_init = Math.acos(x_init / r);
                x = r * Math.cos(angle_init + alpha) + center_x;
                y = r * Math.sin(angle_init + alpha) + center_y;
            }
        }
        return [x, y];
    };
}

/* Transformation : translation
 * 
 * @param dict.borders canvas width and height
 * @param dict.x_speed x axis speed
 * @param dict.y_speed y axis speed
 * @return a function (x, y, dt) returning an array of coordinates
 */
function translation(dict) {
    const borders = dict['borders'] || [];
    const bd_x =    dict['width']   || borders[0] || 0;
    const bd_y =    dict['height']  || borders[1] || 0;
    const v_x =     dict['x_speed'] || 0;
    const v_y =     dict['y_speed'] || 0;

    if (bd_x === 0 && bd_y === 0)
        return ((x, y, dt) => [(x + v_x * dt), (y + v_y * dt)]);
    else
        return ((x, y, dt) => [(x + v_x * dt) % bd_x, (y + v_y * dt) % bd_y]);
}

/* Animation : adding animation to a texture
 *
 * @param dict.texture  texture function
 * @param dict.function array of functions making a transformation
 * @param (x, y, dt)    coordinates of the pixel and time
 * @return a colored pixel corresponding to the position and time (x, y, dt) with the corresponding transformations
 */
function add_animation(dict) {
    const texture = dict['texture']     || basic_textures.solid({});
    const func =    dict['function']    || [];

    return function (x, y, dt) {
        let new_x = x, new_y = y;
        // apply transformations 
        for (let i = 0; i < func.length; i++)
            [new_x, new_y] = func[i](new_x, new_y, dt);

        return texture(new_x, new_y, dt);
    };
}

function animated_chromaticCircle(dict) {
    const r =           dict['size']    || 150;
    const center =      dict['center']  || [];
    const center_x =    dict['centerx'] || center[0] || WIDTH / 2;
    const center_y =    dict['centery'] || center[1] || HEIGHT / 2;
    const colors =      dict['colors']  || [];
    const color_bg =    dict['color1']  || colors[0] || COLORS.black;

    const square = (x) => x * x;
    const abs = (x) => (x > 0) ? x : -x;
    const f = (x) => abs(x % 256 - 128);
    return function (x, y, dt) {
        if (square(y - center_y) + square(x - center_x) < square(r))
            return [f(10 * dt), f(3 * dt), f(7 * dt), 255];
        else
            return color_bg;
    };
}

function animated_caireTiling(dict) {
    const angle =   dict['size']    || 135;

    return function (x, y, dt) {
        const new_angle = 90 + Math.abs((5 * dt + angle) % 180 - 90);
        dict['angle'] = new_angle;
        return TEXTURES.caireTiling(dict)(x, y);
    };
}

function animated_Yinyang(dict) {
    const angle =   dict['angle']   || 10;

    return function (x, y, dt) {
        const new_angle = angle + 5 * dt;
        dict['angle'] = new_angle;
        return TEXTURES.yinyang(dict)(x, y);
    };
}

function animated_randomFunction() {
    function makeInfiniteStates(texture) {
        return node(texture, () => makeInfiniteStates(nextTexture()));
    }

    function getColors(seed, n) {
        const f = (w, x) => ((w * x) % 256);
        let colors = [];
        for (let k = 0; k < n; k++) {
            colors.push([]);
            for (let l = 0; l < 3; l++) {
                colors[k][l] = f(4 * k + l + 1, seed);
            }
            colors[k][3] = 255;
        }
        return colors;
    }

    function nextTexture() {
        const seed = getRandomInt(1000000);
        const texturedict = {
            size: seed % 71 + 10, colors: getColors(seed, 4), angle: seed % 90 + 90, depth: seed % 5 + 1,
            branches: seed % 10 + 3, rows: seed % 29 + 1, columns: seed % 28 + 2
        };
        const funcdict = { function: ((angle, dt) => angle + (seed % 10) * dt), borders_rot: [WIDTH, HEIGHT], angle: 30, x_speed: (seed % 5) * 5, y_speed: (seed % 6) * 5, radius: seed % 150 + 50, freq: seed / 10 % 3 };

        const textureList = [TEXTURES.solid, TEXTURES.horizontalGradient,
            TEXTURES.hexagonTiling, TEXTURES.triangleTiling, TEXTURES.squareTiling,
            TEXTURES.elongatedTriangular, TEXTURES.snubSquare, TEXTURES.snubHexagonal, TEXTURES.trihexagonal,
            TEXTURES.truncatedHexagon, TEXTURES.truncatedSquare, TEXTURES.smallRhombitrihexagonalTiling, TEXTURES.bigRhombitrihexagonalTiling,
            TEXTURES.caireTiling, TEXTURES.cubeTiling, TEXTURES.gambarTiling, TEXTURES.pentagonTiling3];
        const funcList = [rotation, translation, circle];

        const texture = textureList[seed % textureList.length];
        const func = [funcList[seed % funcList.length](funcdict)];
        const time = 100;
        return { time: time, func: add_animation({ texture: texture(texturedict), function: func }) };
    }

    let States = makeInfiniteStates(nextTexture());
    let state = 0;
    let new_state = 0;
    let time = States.val.time;
    return function (x, y, dt) {
        new_state = Math.floor(dt / time);
        new_state = isNaN(new_state) ? state : new_state;
        if (state !== new_state) {
            state = new_state;
            States = nodeThaw(States).children;
            time = States.val.time;
        }
        return States.val.func(x, y, dt);
    };
}

function animated_ForestFire(dict) {
    const treeProbability =         dict['treeP']   || 50;
    const lightningProbability =    dict['treeP']   || 5;

    function makeInfiniteStates(forest, treeP, lightP) {
        return node(forest, () => makeInfiniteStates(forestFire_nextStep(forest, treeP, lightP), treeP, lightP));
    }

    function init_state(dict) {
        const width =           dict['width']   || WIDTH;
        const height =          dict['height']  || HEIGHT;
        const treeProbability = dict['treeP']   || 50;

        // The forest is represented by :
        //   * 0 : Empty
        //   * 1 : Tree
        //   * 2 : Burning
        let forest = [];

        for (let i = 0; i < width; ++i) {
            forest[i] = [];
            for (let j = 0; j < height; ++j) {
                forest[i][j] = (getRandomInt(100) < treeProbability) ? 1 : 0;
            }
        }
        return forest;
    }

    let States = makeInfiniteStates(init_state(dict), treeProbability, lightningProbability);
    let state = 0;
    let new_state = 0;
    let forest = States.val;
    return function (x, y, dt) {
        new_state = Math.floor(dt / 5);
        new_state = isNaN(new_state) ? state : new_state;
        if (state !== new_state) {
            state = new_state;
            States = nodeThaw(States).children;
            forest = States.val;
        }

        if (forest[x][y] === 0) // Empty
            return COLORS.black;
        else if (forest[x][y] === 1) // Tree
            return COLORS.green;
        else // Burning 
            return COLORS.red;
    };
}

function animated_GameOfLife(dict) {

    function makeInfiniteStates(grid) {
        return node(grid, () => makeInfiniteStates(gameOfLife_nextStep(grid)));
    }

    // Return grid with a gosper_glid
    function gosper_glid() {
        let gosper_glider = [];
        const gosp_x = 36;
        const gosp_y = 9;

        // Initialiaze
        for (let i = 0; i < gosp_x; i++) {
            gosper_glider[i] = [];
            for (let j = 0; j < gosp_y; j++) {
                gosper_glider[i][j] = 0;
            }
        }

        const points = [
            [0, 4],
            [1, 4],
            [0, 5],
            [1, 5],
            [10, 4],
            [10, 5],
            [10, 6],
            [11, 3],
            [11, 7],
            [12, 2],
            [12, 8],
            [13, 2],
            [13, 8],
            [14, 5],
            [15, 3],
            [15, 7],
            [16, 4],
            [16, 5],
            [16, 6],
            [17, 5],
            [20, 2],
            [20, 3],
            [20, 4],
            [21, 2],
            [21, 3],
            [21, 4],
            [22, 5],
            [22, 1],
            [24, 0],
            [24, 1],
            [24, 5],
            [24, 6],
            [34, 2],
            [34, 3],
            [35, 2],
            [35, 3]
        ];

        // Add cells alive
        for (let i = 0; i < points.length; i++) {
            gosper_glider[points[i][0]][points[i][1]] = 1;
        }

        return gosper_glider;
    }

    function fireworks() {
        let fireworks = [];
        const fireworks_x = 15;
        const fireworks_y = 19;

        // Initialiaze
        for (let i = 0; i < fireworks_x; i++) {
            fireworks[i] = [];
            for (let j = 0; j < fireworks_y; j++) {
                fireworks[i][j] = 0;
            }
        }

        const points = [
            [-6, -8],
            [-5, -8],
            [-5, -7],
            [-5, -6],
            [-3, -6],
            [-4, -5],
            [-3, -5],
            [2, -4],
            [1, -3],
            [2, -3],
            [2, -2],
            [-1, 3],
            [-1, 4],
            [0, 4],
            [-1, 5],
            [4, 6],
            [5, 6],
            [4, 7],
            [6, 7],
            [6, 8],
            [6, 9],
            [7, 9]
        ];

        // Add cells alive
        for (let i = 0; i < points.length; i++) {
            fireworks[points[i][0] + Math.trunc(fireworks_x / 2)][points[i][1] + Math.trunc(fireworks_y / 2)] = 1;
        }
        return fireworks;
    }

    function sun() {
        let sun = [];
        const sun_x = 48;
        const sun_y = 48;

        // Initialiaze
        for (let i = 0; i < sun_x; i++) {
            sun[i] = [];
            for (let j = 0; j < sun_y; j++) {
                sun[i][j] = 0;
            }
        }

        const points = [
            [-6, -22],
            [7, -22],
            [-13, -21],
            [-12, -21],
            [13, -21],
            [14, -21],
            [-14, -20],
            [-13, -20],
            [-12, -20],
            [-8, -20],
            [-7, -20],
            [8, -20],
            [9, -20],
            [13, -20],
            [14, -20],
            [15, -20],
            [-8, -19],
            [-7, -19],
            [-5, -19],
            [-4, -19],
            [5, -19],
            [6, -19],
            [8, -19],
            [9, -19],
            [-6, -18],
            [7, -18],
            [-20, -14],
            [21, -14],
            [-21, -13],
            [-20, -13],
            [21, -13],
            [22, -13],
            [-21, 12],
            [-20, -12],
            [21, -12],
            [22, -12],
            [-20, -8],
            [-19, -8],
            [20, -8],
            [21, -8],
            [-20, -7],
            [-19, -7],
            [20, -7],
            [21, -7],
            [-22, -6],
            [-18, -6],
            [19, -6],
            [23, -6],
            [-19, -5],
            [-19, -4],
            [20, -5],
            [20, -4],
            [-19, 5],
            [20, 5],
            [-19, 6],
            [20, 6],
            [-22, 7],
            [-18, 7],
            [19, 7],
            [23, 7],
            [-20, 8],
            [-19, 8],
            [20, 8],
            [21, 8],
            [-20, 9],
            [-19, 9],
            [20, 9],
            [21, 9],
            [-21, 13],
            [-20, 13],
            [21, 13],
            [22, 13],
            [-21, 14],
            [-20, 14],
            [21, 14],
            [22, 14],
            [-20, 15],
            [21, 15],
            [-6, 19],
            [7, 19],
            [-8, 20],
            [-7, 20],
            [-5, 20],
            [-4, 20],
            [5, 20],
            [6, 20],
            [8, 20],
            [9, 20],
            [-14, 21],
            [-13, 21],
            [-12, 21],
            [-8, 21],
            [-7, 21],
            [8, 21],
            [9, 21],
            [13, 21],
            [14, 21],
            [15, 21],
            [-13, 22],
            [-12, 22],
            [13, 22],
            [14, 22],
            [-6, 23],
            [7, 23]
        ];

        // Add cells alive
        for (let i = 0; i < points.length; i++) {
            sun[points[i][0] + Math.trunc(sun_x / 2)][points[i][1] + Math.trunc(sun_y / 2)] = 1;
        }
        return sun;
    }

    function flip() {
        let flipper = [];
        const flip_x = 25;
        const flip_y = 35;

        // Initialiaze
        for (let i = 0; i < flip_x; i++) {
            flipper[i] = [];
            for (let j = 0; j < flip_y; j++) {
                flipper[i][j] = 0;
            }
        }

        const points = [
            [-7, -17],
            [-6, -17],
            [-5, -17],
            [5, -17],
            [6, -17],
            [7, -17],
            [-7, -16],
            [-4, -16],
            [5, -16],
            [8, -16],
            [-7, -15],
            [0, -15],
            [5, -15],
            [-7, -14],
            [-1, -14],
            [0, -14],
            [1, -14],
            [5, -14],
            [-7, -13],
            [-1, -13],
            [1, -13],
            [2, -13],
            [5, -13],
            [-7, -12],
            [0, -12],
            [1, -12],
            [2, -12],
            [5, -12],
            [-6, -11],
            [-3, -11],
            [0, -11],
            [1, -11],
            [2, -11],
            [6, -11],
            [-4, -10],
            [0, -10],
            [1, -10],
            [2, -10],
            [-3, -9],
            [3, -9],
            [4, -9],
            [-2, -8],
            [-1, -8],
            [-2, -7],
            [-1, -6],
            [0, -6],
            [-11, -5],
            [-2, -5],
            [0, -5],
            [2, -5],
            [11, -5],
            [-12, -4],
            [-6, -4],
            [-4, -4],
            [-2, -4],
            [0, -4],
            [2, -4],
            [3, -4],
            [6, -4],
            [12, -4],
            [-12, -3],
            [-6, -3],
            [-5, -3],
            [-4, -3],
            [0, -3],
            [2, -3],
            [4, -3],
            [5, -3],
            [6, -3],
            [12, -3],
            [-12, -2],
            [-11, -2],
            [-10, -2],
            [-9, -2],
            [-8, -2],
            [-6, -2],
            [-2, -2],
            [-1, -2],
            [2, -2],
            [6, -2],
            [8, -2],
            [9, -2],
            [10, -2],
            [11, -2],
            [12, -2],
            [-4, -1],
            [-2, -1],
            [1, -1],
            [2, -1],
            [4, -1],
            [-5, 0],
            [-4, 0],
            [-2, 0],
            [0, 0],
            [2, 0],
            [4, 0],
            [5, 0],
            [-4, 1],
            [-2, 1],
            [-1, 1],
            [2, 1],
            [4, 1],
            [-12, 2],
            [-11, 2],
            [-10, 2],
            [-9, 2],
            [-8, 2],
            [-6, 2],
            [-2, 2],
            [1, 2],
            [2, 2],
            [6, 2],
            [8, 2],
            [9, 2],
            [10, 2],
            [11, 2],
            [12, 2],
            [-12, 3],
            [-6, 3],
            [-5, 3],
            [-4, 3],
            [-2, 3],
            [0, 3],
            [4, 3],
            [5, 3],
            [6, 3],
            [12, 3],
            [-12, 4],
            [-6, 4],
            [-3, 4],
            [-2, 4],
            [0, 4],
            [2, 4],
            [4, 4],
            [6, 4],
            [12, 4],
            [-11, 5],
            [-2, 5],
            [0, 5],
            [2, 5],
            [11, 5],
            [0, 6],
            [1, 6],
            [2, 7],
            [1, 8],
            [2, 8],
            [-4, 9],
            [-3, 9],
            [3, 9],
            [-2, 10],
            [-1, 10],
            [0, 10],
            [4, 10],
            [-6, 11],
            [-2, 11],
            [-1, 11],
            [0, 11],
            [3, 11],
            [6, 11],
            [-5, 12],
            [-2, 12],
            [-1, 12],
            [0, 12],
            [7, 12],
            [-5, 13],
            [-2, 13],
            [-1, 13],
            [1, 13],
            [7, 13],
            [-5, 14],
            [-1, 14],
            [0, 14],
            [1, 14],
            [7, 14],
            [-5, 15],
            [0, 15],
            [7, 15],
            [-8, 16],
            [-5, 16],
            [4, 16],
            [7, 16],
            [-7, 17],
            [-6, 17],
            [-5, 17],
            [5, 17],
            [6, 17],
            [7, 17]
        ];

        // Add cells alive
        for (let i = 0; i < points.length; i++) {
            flipper[points[i][0] + Math.trunc(flip_x / 2)][points[i][1] + Math.trunc(flip_y / 2)] = 1;
        }
        return flipper;
    }

    function ship(f, x, y) { return { ship: f, size_x: x, size_y: y }; }
    const configList = { flipper: ship(flip, 25, 35), gosper: ship(gosper_glid, 36, 9), fireworks: ship(fireworks, 14, 18), sun: ship(sun, 48, 48) };

    function init_state(dict) {
        const width =   dict['width']               || WIDTH;
        const height =  dict['height']              || HEIGHT;
        const config =  configList[dict['config']]  || configList['flipper'];

        // The grid is represented by :
        //   * 0 : Dead
        //   * 1 : Alive
        let grid = [];

        // All grid => dead cells
        for (let i = 0; i < width; i++) {
            grid[i] = [];
            for (let j = 0; j < height; j++) {
                grid[i][j] = 0;
            }
        }

        // Generic way to produce animation
        const ship = config.ship();
        const size_x = config.size_x;
        const size_y = config.size_y;

        for (let i = 0; i < size_x; i++) {
            for (let j = 0; j < size_y; j++) {
                grid[width / 2 + i - Math.trunc(size_x / 2)][height / 2 + j - Math.trunc(size_y / 2)] = ship[i][j];
            }
        }

        return grid;
    }

    let States = makeInfiniteStates(init_state(dict));
    let state = 0;
    let new_state = 0;
    let grid = States.val;
    return function (x, y, dt) {
        new_state = Math.floor(dt / 5);
        new_state = isNaN(new_state) ? 0 : new_state;
        if (state !== new_state) {
            state = new_state;
            States = nodeThaw(States).children;
            grid = States.val;
        }

        if (grid[x][y] === 0) // Dead
            return COLORS.white;
        else // Alive
            return COLORS.black;
    };
}

function animated_GreenbergHastings(dict) {
    const width =   dict['width']   || WIDTH;
    const height =  dict['height']  || HEIGHT;
    const color1 =  dict['color1']  || COLORS.red;
    const color2 =  dict['color2']  || COLORS.blue;
    const color3 =  dict['color3']  || COLORS.green;
    const colors =  dict['colors']  || [color1, color2, color3];

    function makeInfiniteStates(grid) {
        return node(grid, () => makeInfiniteStates(Greenberg_Hastings_nextstep(grid)));
    }

    function init_state() {
        // Greenberg-Hastings
        // 0 : Excited time
        // 1 : Refractory time 
        // 2 : Resting time 

        let grid = [];

        // Initialization grid 
        for (let i = 0; i < width; ++i) {
            grid[i] = [];
            for (let j = 0; j < height; ++j) {
                grid[i][j] = 2;
            }
        }

        // Double line
        const size_line = 20;
        const random_x = getRandomInt(width - size_line);
        const random_y = getRandomInt(height - size_line);
        for (let r = 0; r < size_line; r++) {
            let ri = random_x + r;
            let rj = random_y;

            grid[ri][rj] = 1;
            grid[ri][rj + 1] = 0;
        }

        return grid;
    }

    let States = makeInfiniteStates(init_state());
    let state = 0;
    let new_state = 0;
    let grid = States.val;
    return function (x, y, dt) {
        new_state = Math.floor(dt / 1);
        new_state = isNaN(new_state) ? state : new_state;
        if (state !== new_state) {
            state = new_state;
            States = (state % Math.floor((HEIGHT > WIDTH ? HEIGHT : WIDTH)) === 0) ? makeInfiniteStates(init_state()) : nodeThaw(States).children;
            grid = States.val;
        }

        return colors[grid[x][y]];
    };
}

function animated_rain() {
    function makeInfiniteStates(state) {
        return node(state, () => makeInfiniteStates(nextState(state)));
    }

    function rain(state) {
        const rain_state = state;
        return function (x, y) {
            let droplet = rain_state[x];
            return (y > droplet && y < droplet + 6) ? COLORS.white : COLORS.black;
        };
    }

    function nextState(state) {
        let new_state = [];
        for (let i = 0; i < WIDTH; i++) {
            let droplet = state[i];
            droplet = (droplet >= HEIGHT && Math.random() > 0.995) ? 0 : droplet + 2;
            new_state[i] = droplet;
        }
        return new_state;
    }

    function initState() {
        let state = [];
        for (let i = 0; i < WIDTH; i++) {
            state[i] = (getRandomInt(50) === 0) ? 0 : HEIGHT;
        }
        return state;
    }

    let States = makeInfiniteStates(initState());
    let state = 0;
    let new_state = 0;
    let rain_state = rain(States.val);
    return function (x, y, dt) {
        new_state = Math.floor(dt / 0.1);
        new_state = isNaN(new_state) ? state : new_state;
        if (state !== new_state) {
            state = new_state;
            States = nodeThaw(States).children;
            rain_state = rain(States.val);
        }

        return rain_state(x, y);
    };
}

// Exports
exports.caireTiling         = animated_caireTiling;
exports.chromaticCircle     = animated_chromaticCircle;
exports.Yinyang             = animated_Yinyang;
exports.randomFunction      = animated_randomFunction;
exports.ForestFire          = animated_ForestFire;
exports.GameOfLife          = animated_GameOfLife;
exports.GreenbergHastings   = animated_GreenbergHastings;
exports.rain                = animated_rain;