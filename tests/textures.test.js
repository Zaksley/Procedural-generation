"use strict";

const M = require("../src/main_func.js");
const BT = require("../src/textures/basic_textures.js");
const TT = require("../src/textures/regular_tilings_textures.js");
const AT = require("../src/textures/cellular_automata_textures.js");

const { createCanvas } = require('canvas');

describe('Textures test suite', () => {

    test('Solid texture', () => {
        let expected = [];
        const color = [255, 0, 0, 255];
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
        const black = [0, 0, 0, 255];
        const white = [255, 255, 255, 255];
        const grey = [127, 127, 127, 255];
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

});

