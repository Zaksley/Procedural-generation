"use strict";

const M = require("../src/main_func.js");
const BT = require("../src/textures/basic_textures.js");
const TT = require("../src/textures/regular_tilings_textures.js");
const AT = require("../src/textures/cellular_automata_textures.js");
const { COLORS } = require('../src/vars.js');

const { createCanvas } = require('canvas');

describe('Textures test suite', () => {

    test('Solid texture', () => {
        let expected = [];
        const color = COLORS.cyan;
        for (let i = 0; i < 9; ++i)
        {
            expected[4*i] = color[0];
            expected[4*i + 1] = color[1];
            expected[4*i + 2] = color[2];
            expected[4*i + 3] = color[3];
        }

        let canvas = createCanvas(3, 3);
        let found = M.generateTexture(canvas, BT.solid({"color1": color}));

        for (let i = 0; i < 9; ++i)
        {
            expect(found[4*i]).toEqual(expected[4*i]);
            expect(found[4*i + 1]).toEqual(expected[4*i + 1]);
            expect(found[4*i + 2]).toEqual(expected[4*i + 2]);
            expect(found[4*i + 3]).toEqual(expected[4*i + 3]);
        }
    });


    test('Gradient texture', () => {
        let expected = [];
        const black = COLORS.black;
        const white = COLORS.white;
        const grey = COLORS.grey;
        for (let i = 0; i < 9; ++i)
        {
            
            expected[4*i] = ((i%3) === 0) ? white[0] : (((i%3) === 1) ? grey[0] : black[0]);
            expected[4*i + 1] = ((i%3) === 0) ? white[1] : (((i%3) === 1) ? grey[1] : black[1]);
            expected[4*i + 2] = ((i%3) === 0) ? white[2] : (((i%3) === 1) ? grey[2] : black[2]);
            expected[4*i + 3] = ((i%3) === 0) ? white[3] : (((i%3) === 1) ? grey[3] : black[3]);
        }

        let canvas = createCanvas(3, 3);
        let found = M.generateTexture(canvas, BT.horizontalGradient({"width": 3, "height": 3, "color1": white, "color2": black, "angle": 0, "columns": 1}));
        for (let i = 0; i < 9; ++i)
        {
            expect(found[4*i]).toEqual(expected[4*i]);
            expect(found[4*i + 1]).toEqual(expected[4*i + 1]);
            expect(found[4*i + 2]).toEqual(expected[4*i + 2]);
            expect(found[4*i + 3]).toEqual(expected[4*i + 3]);
        }
    });


        test('Square tiling texture', () => {
            let expected = [];
            const black = COLORS.black;
            const white = COLORS.white;
            for (let i = 0; i < 9; ++i)
            {
                
                expected[4*i] = ((i%2) === 0) ? white[0] :  black[0];
                expected[4*i + 1] = ((i%2) === 0) ? white[1] : black[1];
                expected[4*i + 2] = ((i%2) === 0) ? white[2] : black[2];
                expected[4*i + 3] = ((i%2) === 0) ? white[3] : black[3];
            }

            let canvas = createCanvas(3, 3);
            let found = M.generateTexture(canvas, TT.squareTiling({"width": 3, "height": 3, "color1": white, "color2": black, "rows": 3, "columns": 3}));
            for (let i = 0; i < 9; ++i)
            {
                expect(found[4*i]).toEqual(expected[4*i]);
                expect(found[4*i + 1]).toEqual(expected[4*i + 1]);
                expect(found[4*i + 2]).toEqual(expected[4*i + 2]);
                expect(found[4*i + 3]).toEqual(expected[4*i + 3]);
            }
    });

    test('Elementary Cellular (Rule 90) texture', () => {
        let expected = [];
        for (let i = 0; i < 25; ++i)
        {
            expected[4*i] = 255;
            expected[4*i + 1] = 255;
            expected[4*i + 2] = 255;
            expected[4*i + 3] = 255;
        }

        const onCells = [2, 6, 8, 10, 14, 15, 16, 18, 19, 21, 23];
        for (let i in onCells)
        {
            expected[onCells[i]*4] = 0;
            expected[onCells[i]*4 + 1] = 0;
            expected[onCells[i]*4 + 2] = 0;

        }
        
        let canvas = createCanvas(5, 5);
        let found = M.generateTexture(canvas, AT.elementaryCellularAutomaton({"width": 5, "height": 5, "rule": AT.getRule("90")}));
        
        for (let i = 0; i < 25; ++i)
        {
            expect(found[4*i]).toEqual(expected[4*i]);
            expect(found[4*i + 1]).toEqual(expected[4*i + 1]);
            expect(found[4*i + 2]).toEqual(expected[4*i + 2]);
            expect(found[4*i + 3]).toEqual(expected[4*i + 3]);
        }
    });

    test('Cyclic 1D Cellular texture', () => {
        // this array is flipped, so test is f[i][j] = e[j][i]
        const expected = [[0,0,1,3,2],
                          [0,1,1,3,3],
                          [1,1,1,3,0],
                          [1,1,1,0,1],
                          [1,1,1,1,1]
                         ];

        let found = [[0,0,0,0,0],
                     [0,0,0,0,0],
                     [1,0,0,0,0],
                     [3,0,0,0,0],
                     [2,0,0,0,0]
                    ];

        for (let i = 1; i < 5; ++i)
        {
            found = AT.cyclic1D_nextStep(found, i);
        }

        for (let i = 0; i < 5; ++i)
        {
            for (let j = 0; j < 5; ++j)
            {
                expect(found[i][j]).toEqual(expected[j][i]);
            }
        }
    });

    test('Game of Life Cellular texture : overpopulation', () => {
        const first = [[0,0,0,0,0],
                       [0,1,1,0,0],
                       [0,0,1,1,0],
                       [0,0,1,0,0],
                       [0,0,0,0,0]
                      ];

        let found = AT.gameOfLife_nextStep(first);

        expect(found[2][2]).toEqual(0);
    });

    test('Game of Life Cellular texture : loneliness', () => {
        const first = [[0,0,0,0,0],
                       [0,0,0,0,0],
                       [0,0,1,1,0],
                       [0,0,0,0,0],
                       [0,0,0,0,0]
                      ];

        let found = AT.gameOfLife_nextStep(first);

        expect(found[2][2]).toEqual(0);
    });

    test('Game of Life Cellular texture : staying alive', () => {
        const first = [[0,0,0,0,0],
                       [0,0,0,0,0],
                       [0,0,1,1,0],
                       [0,0,1,0,0],
                       [0,0,0,0,0]
                      ];

        let found = AT.gameOfLife_nextStep(first);

        expect(found[2][2]).toEqual(1);
    });

    test('Game of Life Cellular texture : from dead to alive', () => {
        const first = [[0,0,0,0,0],
                       [0,0,0,0,0],
                       [0,0,0,1,0],
                       [0,0,1,1,0],
                       [0,0,0,0,0]
                      ];

        let found = AT.gameOfLife_nextStep(first);

        expect(found[2][2]).toEqual(1);
    });
});

