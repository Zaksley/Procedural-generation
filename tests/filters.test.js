const BF = require("../src/filters/basic_filters.js");
const { COLORS } = require('../src/vars.js');

describe('Filters test suite', () => {

    test('Horizontal flip filter (size 3)', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const white = COLORS.white;
        for (let i = 0; i < 9; ++i) {
            expected[4 * i] = red[0];
            expected[4 * i + 1] = red[1];
            expected[4 * i + 2] = red[2];
            expected[4 * i + 3] = red[3];

            found[4 * i] = red[0];
            found[4 * i + 1] = red[1];
            found[4 * i + 2] = red[2];
            found[4 * i + 3] = red[3];
        }

        const whiteCellsFirst = [2, 3, 4, 7];
        const whiteCellsSecond = [1, 3, 4, 8];

        for (let i in whiteCellsFirst) {
            found[4 * whiteCellsFirst[i]] = white[0];
            found[4 * whiteCellsFirst[i] + 1] = white[1];
            found[4 * whiteCellsFirst[i] + 2] = white[2];
            found[4 * whiteCellsFirst[i] + 3] = white[3];
        }

        for (let i in whiteCellsSecond) {
            expected[4 * whiteCellsSecond[i]] = white[0];
            expected[4 * whiteCellsSecond[i] + 1] = white[1];
            expected[4 * whiteCellsSecond[i] + 2] = white[2];
            expected[4 * whiteCellsSecond[i] + 3] = white[3];
        }

        found = BF.horizontalFlip({ "width": 3 })(found);

        for (let i = 0; i < 9; ++i) {
            expect(found[4 * i]).toEqual(expected[4 * i]);
            expect(found[4 * i + 1]).toEqual(expected[4 * i + 1]);
            expect(found[4 * i + 2]).toEqual(expected[4 * i + 2]);
            expect(found[4 * i + 3]).toEqual(expected[4 * i + 3]);
        }
    });

    test('Horizontal flip filter (size 5)', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const white = COLORS.white;
        for (let i = 0; i < 25; ++i) {
            expected[4 * i] = red[0];
            expected[4 * i + 1] = red[1];
            expected[4 * i + 2] = red[2];
            expected[4 * i + 3] = red[3];

            found[4 * i] = red[0];
            found[4 * i + 1] = red[1];
            found[4 * i + 2] = red[2];
            found[4 * i + 3] = red[3];
        }

        const whiteCellsFirst = [0, 1, 3, 7, 11, 15, 16, 18, 19, 22, 24];
        const whiteCellsSecond = [20, 21, 23, 17, 11, 5, 6, 8, 9, 2, 4];

        for (let i in whiteCellsFirst) {
            found[4 * whiteCellsFirst[i]] = white[0];
            found[4 * whiteCellsFirst[i] + 1] = white[1];
            found[4 * whiteCellsFirst[i] + 2] = white[2];
            found[4 * whiteCellsFirst[i] + 3] = white[3];
        }

        for (let i in whiteCellsSecond) {
            expected[4 * whiteCellsSecond[i]] = white[0];
            expected[4 * whiteCellsSecond[i] + 1] = white[1];
            expected[4 * whiteCellsSecond[i] + 2] = white[2];
            expected[4 * whiteCellsSecond[i] + 3] = white[3];
        }

        found = BF.horizontalFlip({ "width": 5 })(found);

        for (let i = 0; i < 25; ++i) {
            expect(found[4 * i]).toEqual(expected[4 * i]);
            expect(found[4 * i + 1]).toEqual(expected[4 * i + 1]);
            expect(found[4 * i + 2]).toEqual(expected[4 * i + 2]);
            expect(found[4 * i + 3]).toEqual(expected[4 * i + 3]);
        }
    });

    test('Vertical flip filter (size 3)', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const white = COLORS.white;
        for (let i = 0; i < 9; ++i) {
            expected[4 * i] = red[0];
            expected[4 * i + 1] = red[1];
            expected[4 * i + 2] = red[2];
            expected[4 * i + 3] = red[3];

            found[4 * i] = red[0];
            found[4 * i + 1] = red[1];
            found[4 * i + 2] = red[2];
            found[4 * i + 3] = red[3];
        }

        const whiteCellsFirst = [2, 3, 4, 7];
        const whiteCellsSecond = [0, 4, 5, 7];

        for (let i in whiteCellsFirst) {
            found[4 * whiteCellsFirst[i]] = white[0];
            found[4 * whiteCellsFirst[i] + 1] = white[1];
            found[4 * whiteCellsFirst[i] + 2] = white[2];
            found[4 * whiteCellsFirst[i] + 3] = white[3];
        }

        for (let i in whiteCellsSecond) {
            expected[4 * whiteCellsSecond[i]] = white[0];
            expected[4 * whiteCellsSecond[i] + 1] = white[1];
            expected[4 * whiteCellsSecond[i] + 2] = white[2];
            expected[4 * whiteCellsSecond[i] + 3] = white[3];
        }

        found = BF.verticalFlip({ "width": 3 })(found);

        for (let i = 0; i < 9; ++i) {
            expect(found[4 * i]).toEqual(expected[4 * i]);
            expect(found[4 * i + 1]).toEqual(expected[4 * i + 1]);
            expect(found[4 * i + 2]).toEqual(expected[4 * i + 2]);
            expect(found[4 * i + 3]).toEqual(expected[4 * i + 3]);
        }
    });

    test('Vertical flip filter (size 5)', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const white = COLORS.white;
        for (let i = 0; i < 25; ++i) {
            expected[4 * i] = red[0];
            expected[4 * i + 1] = red[1];
            expected[4 * i + 2] = red[2];
            expected[4 * i + 3] = red[3];

            found[4 * i] = red[0];
            found[4 * i + 1] = red[1];
            found[4 * i + 2] = red[2];
            found[4 * i + 3] = red[3];
        }

        const whiteCellsFirst = [0, 1, 3, 7, 11, 15, 16, 18, 19, 22, 24];
        const whiteCellsSecond = [4, 3, 1, 7, 13, 19, 18, 16, 15, 20, 22];

        for (let i in whiteCellsFirst) {
            found[4 * whiteCellsFirst[i]] = white[0];
            found[4 * whiteCellsFirst[i] + 1] = white[1];
            found[4 * whiteCellsFirst[i] + 2] = white[2];
            found[4 * whiteCellsFirst[i] + 3] = white[3];
        }

        for (let i in whiteCellsSecond) {
            expected[4 * whiteCellsSecond[i]] = white[0];
            expected[4 * whiteCellsSecond[i] + 1] = white[1];
            expected[4 * whiteCellsSecond[i] + 2] = white[2];
            expected[4 * whiteCellsSecond[i] + 3] = white[3];
        }

        found = BF.verticalFlip({ "width": 5 })(found);

        for (let i = 0; i < 25; ++i) {
            expect(found[4 * i]).toEqual(expected[4 * i]);
            expect(found[4 * i + 1]).toEqual(expected[4 * i + 1]);
            expect(found[4 * i + 2]).toEqual(expected[4 * i + 2]);
            expect(found[4 * i + 3]).toEqual(expected[4 * i + 3]);
        }
    });

    test('Negative color filter (size 3)', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const ired = [0, 255, 255, 255];
        const white = COLORS.white;
        const iwhite = COLORS.black;
        for (let i = 0; i < 9; ++i) {
            expected[4 * i] = ired[0];
            expected[4 * i + 1] = ired[1];
            expected[4 * i + 2] = ired[2];
            expected[4 * i + 3] = ired[3];

            found[4 * i] = red[0];
            found[4 * i + 1] = red[1];
            found[4 * i + 2] = red[2];
            found[4 * i + 3] = red[3];
        }

        const whiteCells = [2, 3, 4, 7];

        for (let i in whiteCells) {
            expected[4 * whiteCells[i]] = iwhite[0];
            expected[4 * whiteCells[i] + 1] = iwhite[1];
            expected[4 * whiteCells[i] + 2] = iwhite[2];
            expected[4 * whiteCells[i] + 3] = iwhite[3];

            found[4 * whiteCells[i]] = white[0];
            found[4 * whiteCells[i] + 1] = white[1];
            found[4 * whiteCells[i] + 2] = white[2];
            found[4 * whiteCells[i] + 3] = white[3];
        }

        found = BF.negativeImage(found);

        for (let i = 0; i < 9; ++i) {
            expect(found[4 * i]).toEqual(expected[4 * i]);
            expect(found[4 * i + 1]).toEqual(expected[4 * i + 1]);
            expect(found[4 * i + 2]).toEqual(expected[4 * i + 2]);
            expect(found[4 * i + 3]).toEqual(expected[4 * i + 3]);
        }
    });

    test('Negative color filter (size 5)', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const ired = [0, 255, 255, 255];
        const white = COLORS.white;
        const iwhite = COLORS.black;
        for (let i = 0; i < 25; ++i) {
            expected[4 * i] = ired[0];
            expected[4 * i + 1] = ired[1];
            expected[4 * i + 2] = ired[2];
            expected[4 * i + 3] = ired[3];

            found[4 * i] = red[0];
            found[4 * i + 1] = red[1];
            found[4 * i + 2] = red[2];
            found[4 * i + 3] = red[3];
        }

        const whiteCells = [0, 1, 3, 7, 11, 15, 16, 18, 19, 22, 24];

        for (let i in whiteCells) {
            expected[4 * whiteCells[i]] = iwhite[0];
            expected[4 * whiteCells[i] + 1] = iwhite[1];
            expected[4 * whiteCells[i] + 2] = iwhite[2];
            expected[4 * whiteCells[i] + 3] = iwhite[3];

            found[4 * whiteCells[i]] = white[0];
            found[4 * whiteCells[i] + 1] = white[1];
            found[4 * whiteCells[i] + 2] = white[2];
            found[4 * whiteCells[i] + 3] = white[3];
        }

        found = BF.negativeImage(found);

        for (let i = 0; i < 25; ++i) {
            expect(found[4 * i]).toEqual(expected[4 * i]);
            expect(found[4 * i + 1]).toEqual(expected[4 * i + 1]);
            expect(found[4 * i + 2]).toEqual(expected[4 * i + 2]);
            expect(found[4 * i + 3]).toEqual(expected[4 * i + 3]);
        }
    });

    test('Replace color filter (size 3)', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const blue = COLORS.blue;
        const white = COLORS.white;
        for (let i = 0; i < 9; ++i) {
            expected[4 * i] = white[0];
            expected[4 * i + 1] = white[1];
            expected[4 * i + 2] = white[2];
            expected[4 * i + 3] = white[3];

            found[4 * i] = white[0];
            found[4 * i + 1] = white[1];
            found[4 * i + 2] = white[2];
            found[4 * i + 3] = white[3];
        }

        const whiteCells = [2, 3, 4, 7];

        for (let i in whiteCells) {
            expected[4 * whiteCells[i]] = blue[0];
            expected[4 * whiteCells[i] + 1] = blue[1];
            expected[4 * whiteCells[i] + 2] = blue[2];
            expected[4 * whiteCells[i] + 3] = blue[3];

            found[4 * whiteCells[i]] = red[0];
            found[4 * whiteCells[i] + 1] = red[1];
            found[4 * whiteCells[i] + 2] = red[2];
            found[4 * whiteCells[i] + 3] = red[3];
        }

        found = BF.replaceColor({ "width": 3, "height": 3, "color1": red, "color2": blue })(found);

        for (let i = 0; i < 9; ++i) {
            expect(found[4 * i]).toEqual(expected[4 * i]);
            expect(found[4 * i + 1]).toEqual(expected[4 * i + 1]);
            expect(found[4 * i + 2]).toEqual(expected[4 * i + 2]);
            expect(found[4 * i + 3]).toEqual(expected[4 * i + 3]);
        }
    });

    test('Replace color filter (size 5)', () => {
        let expected = [];
        let found = [];

        const red = COLORS.red;
        const blue = COLORS.blue;
        const white = COLORS.white;
        for (let i = 0; i < 25; ++i) {
            expected[4 * i] = white[0];
            expected[4 * i + 1] = white[1];
            expected[4 * i + 2] = white[2];
            expected[4 * i + 3] = white[3];

            found[4 * i] = white[0];
            found[4 * i + 1] = white[1];
            found[4 * i + 2] = white[2];
            found[4 * i + 3] = white[3];
        }

        const whiteCells = [0, 1, 3, 7, 11, 15, 16, 18, 19, 22, 24];

        for (let i in whiteCells) {
            expected[4 * whiteCells[i]] = blue[0];
            expected[4 * whiteCells[i] + 1] = blue[1];
            expected[4 * whiteCells[i] + 2] = blue[2];
            expected[4 * whiteCells[i] + 3] = blue[3];

            found[4 * whiteCells[i]] = red[0];
            found[4 * whiteCells[i] + 1] = red[1];
            found[4 * whiteCells[i] + 2] = red[2];
            found[4 * whiteCells[i] + 3] = red[3];
        }

        found = BF.replaceColor({ "width": 5, "height": 5, "color1": red, "color2": blue })(found);

        for (let i = 0; i < 25; ++i) {
            expect(found[4 * i]).toEqual(expected[4 * i]);
            expect(found[4 * i + 1]).toEqual(expected[4 * i + 1]);
            expect(found[4 * i + 2]).toEqual(expected[4 * i + 2]);
            expect(found[4 * i + 3]).toEqual(expected[4 * i + 3]);
        }
    });
});
