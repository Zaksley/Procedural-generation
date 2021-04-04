function chromatic_circle(r) {
    return function (center_x) {
        return function (center_y) {
            return function (x, y, dt) {

                const square = (x) => x * x;
                const abs = (x) => x > 0 ? x : -x;
                const f = (x) => abs(x % 256 - 128);
                if (square(y - center_y) + square(x - center_x) < square(r))
                    return [f(10 * dt), f(3 * dt), f(7 * dt), 255];
                else
                    return [0, 0, 0, 255];
            };
        };
    };
}

function animated_caireTiling(size) {
    return function (angle) {
        return function (color1) {
            return function (color2) {
                return function (color3) {
                    return function (color4) {
                        return function (x, y, dt) {
                            const new_angle = 90 + Math.abs((5 * dt + angle) % 180 - 90);
                            return texture_caireTiling(size)(new_angle)(color1)(color2)(color3)(color4)(x, y);
                        };
                    };
                };
            };
        };
    };
}

//exports.chromatic_circle = chromatic_circle;