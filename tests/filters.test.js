const BF = require("../src/filters/basic_filters.js");
const { COLORS } = require('../src/vars.js');

describe('Filters test suite', () => {

    test('Horizontal flip filter', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const white = COLORS.white;
        for (let i = 0; i < 9; ++i)
        {
            expected[4*i] = red[0];
            expected[4*i + 1] = red[1];
            expected[4*i + 2] = red[2];
            expected[4*i + 3] = red[3];

            found[4*i] = red[0];
            found[4*i + 1] = red[1];
            found[4*i + 2] = red[2];
            found[4*i + 3] = red[3];

        }

        const whiteCellsFirst = [2, 3, 4, 7];
        const whiteCellsSecond = [1, 3, 4, 8];

        for (let i in whiteCellsFirst)
        {
            found[4*whiteCellsFirst[i]] = white[0];
            found[4*whiteCellsFirst[i] + 1] = white[1];
            found[4*whiteCellsFirst[i] + 2] = white[2];
            found[4*whiteCellsFirst[i] + 3] = white[3];
        }

        for (let i in whiteCellsSecond)
        {
            expected[4*whiteCellsSecond[i]] = white[0];
            expected[4*whiteCellsSecond[i] + 1] = white[1];
            expected[4*whiteCellsSecond[i] + 2] = white[2];
            expected[4*whiteCellsSecond[i] + 3] = white[3];
        }

        found = BF.horizontalFlip({"width": 3})(found);
        
        for (let i = 0; i < 9; ++i)
        {
            expect(found[4*i]).toEqual(expected[4*i]);
            expect(found[4*i + 1]).toEqual(expected[4*i + 1]);
            expect(found[4*i + 2]).toEqual(expected[4*i + 2]);
            expect(found[4*i + 3]).toEqual(expected[4*i + 3]);
        }
    });

    test('Vertical flip filter', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const white = COLORS.white;
        for (let i = 0; i < 9; ++i)
        {
            expected[4*i] = red[0];
            expected[4*i + 1] = red[1];
            expected[4*i + 2] = red[2];
            expected[4*i + 3] = red[3];

            found[4*i] = red[0];
            found[4*i + 1] = red[1];
            found[4*i + 2] = red[2];
            found[4*i + 3] = red[3];

        }

        const whiteCellsFirst = [2, 3, 4, 7];
        const whiteCellsSecond = [0, 4, 5, 7];

        for (let i in whiteCellsFirst)
        {
            found[4*whiteCellsFirst[i]] = white[0];
            found[4*whiteCellsFirst[i] + 1] = white[1];
            found[4*whiteCellsFirst[i] + 2] = white[2];
            found[4*whiteCellsFirst[i] + 3] = white[3];
        }

        for (let i in whiteCellsSecond)
        {
            expected[4*whiteCellsSecond[i]] = white[0];
            expected[4*whiteCellsSecond[i] + 1] = white[1];
            expected[4*whiteCellsSecond[i] + 2] = white[2];
            expected[4*whiteCellsSecond[i] + 3] = white[3];
        }

        found = BF.verticalFlip({"width": 3})(found);
        
        for (let i = 0; i < 9; ++i)
        {
            expect(found[4*i]).toEqual(expected[4*i]);
            expect(found[4*i + 1]).toEqual(expected[4*i + 1]);
            expect(found[4*i + 2]).toEqual(expected[4*i + 2]);
            expect(found[4*i + 3]).toEqual(expected[4*i + 3]);
        }
    });
    
    test('Negative color filter', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const ired = [0, 255, 255, 255];
        const white = COLORS.white;
        const iwhite = COLORS.black;
        for (let i = 0; i < 9; ++i)
        {
            expected[4*i] = ired[0];
            expected[4*i + 1] = ired[1];
            expected[4*i + 2] = ired[2];
            expected[4*i + 3] = ired[3];

            found[4*i] = red[0];
            found[4*i + 1] = red[1];
            found[4*i + 2] = red[2];
            found[4*i + 3] = red[3];

        }

        const whiteCells = [2, 3, 4, 7];

        for (let i in whiteCells)
        {
            expected[4*whiteCells[i]] = iwhite[0];
            expected[4*whiteCells[i] + 1] = iwhite[1];
            expected[4*whiteCells[i] + 2] = iwhite[2];
            expected[4*whiteCells[i] + 3] = iwhite[3];

            found[4*whiteCells[i]] = white[0];
            found[4*whiteCells[i] + 1] = white[1];
            found[4*whiteCells[i] + 2] = white[2];
            found[4*whiteCells[i] + 3] = white[3];
        }

        found = BF.negativeImage(found);

        for (let i = 0; i < 9; ++i)
        {
            expect(found[4*i]).toEqual(expected[4*i]);
            expect(found[4*i + 1]).toEqual(expected[4*i + 1]);
            expect(found[4*i + 2]).toEqual(expected[4*i + 2]);
            expect(found[4*i + 3]).toEqual(expected[4*i + 3]);
        }

        
    });

    test('Negative color filter', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const blue = [0, 255, 255, 255];
        const white = COLORS.white;
        for (let i = 0; i < 9; ++i)
        {
            expected[4*i] = white[0];
            expected[4*i + 1] = white[1];
            expected[4*i + 2] = white[2];
            expected[4*i + 3] = white[3];

            found[4*i] = white[0];
            found[4*i + 1] = white[1];
            found[4*i + 2] = white[2];
            found[4*i + 3] = white[3];

        }

        const whiteCells = [2, 3, 4, 7];

        for (let i in whiteCells)
        {
            expected[4*whiteCells[i]] = blue[0];
            expected[4*whiteCells[i] + 1] = blue[1];
            expected[4*whiteCells[i] + 2] = blue[2];
            expected[4*whiteCells[i] + 3] = blue[3];

            found[4*whiteCells[i]] = red[0];
            found[4*whiteCells[i] + 1] = red[1];
            found[4*whiteCells[i] + 2] = red[2];
            found[4*whiteCells[i] + 3] = red[3];
        }

        found = BF.replaceColor({"width": 3, "height": 3, "color1": red, "color2": blue})(found);

        for (let i = 0; i < 9; ++i)
        {
            expect(found[4*i]).toEqual(expected[4*i]);
            expect(found[4*i + 1]).toEqual(expected[4*i + 1]);
            expect(found[4*i + 2]).toEqual(expected[4*i + 2]);
            expect(found[4*i + 3]).toEqual(expected[4*i + 3]);
        }

        
    });

});
