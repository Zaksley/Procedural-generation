'use strict';

// Global variables
const globalVars = require('../vars.js');
const COLORS = globalVars.COLORS;
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;

const tools = require("./tools_for_textures.js");
const getRandomInt = tools.getRandomInt;

/* Returns all neighboors of a cell, using the Moore specification.
 * 
 * @param grid the cellular automata grid
 * @param cell a cell {i,j}
 *
 * @return the Moore neighboors array
 */
function getMooreNeighborsState(grid, cell) {
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

    if (cell.j - 1 >= 0) {
        if (cell.i - 1 >= 0)
            neighs.push(grid[cell.i - 1][cell.j - 1]);
        neighs.push(grid[cell.i][cell.j - 1]);
        if (cell.i + 1 < width)
            neighs.push(grid[cell.i + 1][cell.j - 1]);
    }

    if (cell.i - 1 >= 0)
        neighs.push(grid[cell.i - 1][cell.j]);
    if (cell.i + 1 < width)
        neighs.push(grid[cell.i + 1][cell.j]);

    if (cell.j + 1 < height) {
        if (cell.i - 1 >= 0)
            neighs.push(grid[cell.i - 1][cell.j + 1]);
        neighs.push(grid[cell.i][cell.j + 1]);
        if (cell.i + 1 < width)
            neighs.push(grid[cell.i + 1][cell.j + 1]);
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
function forestFire_nextStep(forest, treeP, lightP) {
    let nextForest = [];

    for (let i = 0; i < forest.length; ++i) {
        nextForest[i] = [];
        for (let j = 0; j < forest[0].length; ++j) {
            if (forest[i][j] === 2) { // Burning : transform into an empty cell
                nextForest[i][j] = 0;
            }
            else if (forest[i][j] === 1) { // Tree : tranform into a burning cell or do nothing    
                let neighborsState = getMooreNeighborsState(forest, { i: i, j: j }).sort();
                if (neighborsState[neighborsState.length - 1] === 2) // has at least one neighbor burning
                    nextForest[i][j] = 2;
                else
                    nextForest[i][j] = (getRandomInt(100) < lightP) ? 2 : 1;
            }
            else {// forest[i][j] === 0 - Empty : transform into a tree cell or do nothing
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
    const width =                   dict['width']   || WIDTH;
    const height =                  dict['height']  || HEIGHT;
    const treeProbability =         dict['treeP']   || 50;
    const lightningProbability =    dict['lightP']  || 5;
    const steps =                   dict['step']    || 30;

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

    for (let k = 0; k < steps; ++k) {
        forest = forestFire_nextStep(forest, treeProbability, lightningProbability);
    }

    return (x, y) => {
        if (forest[x][y] === 0) // Empty
            return COLORS.black;
        else if (forest[x][y] === 1) // Tree
            return COLORS.green;
        else // Burning 
            return COLORS.red;
    };
}

/* Returns the next step of a gameOfLife cellular automaton.
 *
 * @param grid the game of Life grid
 *
 * @return the next cellular automata grid
 */
function gameOfLife_nextStep(grid) {
    let nextGrid = [];

    for (let i = 0; i < grid.length; i++) {
        nextGrid[i] = [];
        for (let j = 0; j < grid[0].length; j++) {
            const aliveNeighbors = getMooreNeighborsState(grid, { i: i, j: j }).reduce((acc, el) => acc += el, 0);
            if (grid[i][j] === 0) // Dead
                nextGrid[i][j] = (aliveNeighbors === 3) ? 1 : 0;
            else // Alive
                nextGrid[i][j] = (aliveNeighbors === 2 || aliveNeighbors === 3) ? 1 : 0;
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
    const width =   dict['width']   || WIDTH;
    const height =  dict['height']  || HEIGHT;
    const steps =   dict['step']    || 1;

    // ==============================
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

    // ================================

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

    // ================================

    // The grid is represented by :
    //   * 0 : Dead
    //   * 1 : Alive
    let grid = [];

    for (let i = 0; i < width; ++i) {
        grid[i] = [];
        for (let j = 0; j < height; ++j) {
            grid[i][j] = 0;
        }
    }

    gosper_glid();

    // Flipper

    const flipper = flip();
    const flip_x = 25;
    const flip_y = 35;

    for (let i = 0; i < flip_x; i++) {
        for (let j = 0; j < flip_y; j++) {
            grid[width / 2 + i - Math.trunc(flip_x / 2)][height / 2 + j - Math.trunc(flip_y / 2)] = flipper[i][j];
        }
    }

    for (let k = 0; k < steps; ++k) {
        grid = gameOfLife_nextStep(grid);
    }


    return (x, y) => {
        if (grid[x][y] === 0) // Dead
            return COLORS.white;
        else // Alive
            return COLORS.black;
    };
}

function Greenberg_Hastings_nextstep(grid) {
    let new_grid = [];

    // Initialization new_grid 
    for (let i = 0; i < grid.length; i++) {
        new_grid[i] = [];
        for (let j = 0; j < grid[0].length; j++) {
            new_grid[i][j] = grid[i][j];
        }
    }

    function excited_neighboor(grid, i, j) {
        for (let ni = -1; ni < 2; ni += 2) {
            let pos_x = i + ni;
            if (pos_x < 0 || pos_x >= grid.length)
                continue;

            // Excited state
            if (grid[pos_x][j] === 0)
                return true;
        }

        for (let nj = -1; nj < 2; nj += 2) {
            let pos_y = j + nj;
            if (pos_y < 0 || pos_y >= grid[0].length)
                continue;

            // Excited state
            if (grid[i][pos_y] === 0)
                return true;
        }

        return false;
    }

    // Update grid
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            // Excited & Refractory state
            if (grid[i][j] === 0 || grid[i][j] === 1)
                new_grid[i][j] = grid[i][j] + 1;
            else if (excited_neighboor(grid, i, j))
                new_grid[i][j] = 0;
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
function texture_greenbergHastings(dict) {
    const width =   dict['width']   || WIDTH;
    const height =  dict['height']  || HEIGHT;
    const step =    dict['step']    || 50;
    const color1 =  dict['color1']  || COLORS.red;
    const color2 =  dict['color2']  || COLORS.blue;
    const color3 =  dict['color3']  || COLORS.green;
    const colors =  dict['colors']  || [color1, color2, color3];

    // Greenberg-Hastings
    // 0 : Excited time (Red)
    // 1 : Refractory time  (Blue)
    // 2 : Resting time    (Green)

    let grid = [];

    // Initialization grid 
    for (let i = 0; i < width; ++i) {
        grid[i] = [];
        for (let j = 0; j < height; ++j) {
            grid[i][j] = 2;
        }
    }

    // Spicy game
    // ================================

    // Double line
    const size_line = 10;
    const random_x = getRandomInt(width - 30);
    const random_y = getRandomInt(height - 30);
    for (let r = 0; r < size_line; r++) {
        let ri = random_x + r;
        let rj_1 = random_y;
        let rj_2 = random_y + 1;

        grid[ri][rj_1] = 1;
        grid[ri][rj_2] = 0;
    }

    // ================================

    // Running the game
    for (let k = 0; k < step; k++) {
        grid = Greenberg_Hastings_nextstep(grid);
    }


    return (x, y) => {
        return colors[grid[x][y]];
    };
}

/* Returns a rule from its name
 *
 * @param rule the rule name
 * @return a rule init/next-state couple
 */
function getRule(rule) {
    switch (rule) {
        case "73":      return [rule73_initGrid, rule73_nextState];
        case "73_rng":  return [ruleDef_initGrid, rule73_nextState];
        case "90":      return [rule90_initGrid, rule90_nextState];
        case "90_rng":  return [ruleDef_initGrid, rule90_nextState];
        case "110":     return [rule110_initGrid, rule110_nextState];
        case "110_rng": return [ruleDef_initGrid, rule110_nextState];
        default:        return [rule73_initGrid, rule73_nextState];
    }
}

// Random initialization
function ruleDef_initGrid(grid) {
    for (let i = 0; i < grid.length; ++i) {
        grid[i][0] = (getRandomInt(100) < 20) ? 1 : 0; // 20% On cells
    }
    return grid;
}

// Rule 110
function rule110_nextState(neighboors) {
    switch (neighboors) {
        case "111": return 0;
        case "110": return 1;
        case "101": return 1;
        case "100": return 0;
        case "011": return 1;
        case "010": return 1;
        case "001": return 1;
        case "000": return 0;
        default:    return 0;
    }
}
function rule110_initGrid(grid) {
    grid[grid.length - 1][0] = 1;
    return grid;
}

// Rule 73
function rule73_nextState(neighboors) {
    switch (neighboors) {
        case "111": return 0;
        case "110": return 1;
        case "101": return 0;
        case "100": return 0;
        case "011": return 1;
        case "010": return 0;
        case "001": return 0;
        case "000": return 1;
        default:    return 0;
    }
}
function rule73_initGrid(grid) {
    grid[Math.floor(grid.length / 2)][0] = 1;
    return grid;
}

// Rule 90
function rule90_nextState(neighboors) {
    switch (neighboors) {
        case "111": return 0;
        case "110": return 1;
        case "101": return 0;
        case "100": return 1;
        case "011": return 1;
        case "010": return 0;
        case "001": return 1;
        case "000": return 0;
        default:    return 0;
    }
}
function rule90_initGrid(grid) {
    grid[Math.floor(grid.length / 2)][0] = 1;
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

    for (let i = 0; i < grid.length; ++i) {
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
    const width =           dict['width']   || WIDTH;
    const height =          dict['height']  || HEIGHT;
    const [init, rule] =    dict['rule']    || [ruleDef_initGrid, rule73_nextState];

    // The grid is represented by :
    //   * 0 : Off
    //   * 1 : On
    let grid = [];

    for (let i = 0; i < width; ++i) {
        grid[i] = [];
        for (let j = 0; j < height; ++j) {
            grid[i][j] = 0;
        }
    }

    grid = init(grid);

    for (let k = 1; k <= height; ++k)
        grid = elem_nextStep(grid, rule, k);

    return (x, y) => {
        if (grid[x][y] === 0) // Off
            return COLORS.white;
        else // On
            return COLORS.black;
    };
}

/* Creates the cyclic one dimensional cellular automaton next step
 *
 * Note : in this case, 1 -> 2 -> 3 -> 0 -> 1
 *
 * @param grid the actual grid
 * @param step the next line
 *
 * @return the next grid
 */
function cyclic1D_nextStep(grid, step) {
    const width = grid.length;

    for (let i = 0; i < grid.length; ++i) {
        const left = (i === 0) ? grid[width - 1][step - 1] : grid[i - 1][step - 1];
        const middle = grid[i][step - 1];
        const right = (i === width - 1) ? grid[0][step - 1] : grid[i + 1][step - 1];

        grid[i][step] = (left === ((middle + 1) % 4) || right === ((middle + 1) % 4)) ? (middle + 1) % 4 : middle;
    }
    return grid;
}

/* Texture : cyclic one dimensional cellular automaton
 *
 * @param dict.width    canvas width
 * @param dict.height   canvas height
 * @param dict.color1   first color
 * @param dict.color2   second color
 * @param dict.color3   third color
 * @param dict.color4   fourth color
 *
 * @return a colored pixel corresponding to (x,y) position
 */
function texture_cyclic1DCellularAutomaton(dict) {
    const width =   dict['width']   || WIDTH;
    const height =  dict['height']  || HEIGHT;
    const color1 =  dict['color1']  || COLORS.blue;
    const color2 =  dict['color2']  || COLORS.red;
    const color3 =  dict['color3']  || COLORS.green;
    const color4 =  dict['color4']  || COLORS.orange;

    // The grid is represented by :
    //   * 0 : Blue
    //   * 1 : Red
    //   * 2 : Green
    //   * 3 : Orange
    let grid = [];

    for (let i = 0; i < width; ++i) {
        grid[i] = [];
        for (let j = 0; j < height; ++j) {
            grid[i][j] = getRandomInt(4);
        }
    }

    for (let k = 1; k <= height; ++k) {
        grid = cyclic1D_nextStep(grid, k);
    }

    return (x, y) => {
        if (grid[x][y] === 0) // Blue
            return color1;
        else if (grid[x][y] === 1) // Red
            return color2;
        else if (grid[x][y] === 2) // Green
            return color3;
        else // Orange
            return color4;
    };
}

// Exports
exports.getRule                     = getRule;
exports.cyclic1DCellularAutomaton   = texture_cyclic1DCellularAutomaton;
exports.cyclic1D_nextStep           = cyclic1D_nextStep;
exports.elementaryCellularAutomaton = texture_elementaryCellularAutomaton;
exports.greenbergHastings           = texture_greenbergHastings;
exports.Greenberg_Hastings_nextstep = Greenberg_Hastings_nextstep;
exports.gameOfLife                  = texture_gameOfLife;
exports.gameOfLife_nextStep         = gameOfLife_nextStep;
exports.forestFire                  = texture_forestFire;
exports.forestFire_nextStep         = forestFire_nextStep;
