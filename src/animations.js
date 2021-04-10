function chromatic_circle(dict) {
    const r = dict['radius']      || 150;
    const center = dict['center'] || []
    const center_x = center[0]    || 250;
    const center_y = center[1]    || 250;
    const colors = dict['colors'] || [];
    const color_bg = colors[0]    || COLORS.black;

    const square = (x) => x * x;
    const abs = (x) => x > 0 ? x : -x;
    const f = (x) => abs(x % 256 - 128);
    return function (x, y, dt) {
        if (square(y - center_y) + square(x - center_x) < square(r))
            return [f(10 * dt), f(3 * dt), f(7 * dt), 255];
        else
            return color_bg;
    };
}

function animated_caireTiling(dict) {
    const size = dict['size']       || 50;
    const angle = dict['size']      || 135;
    const colors = dict['colors']   || [];
    const color1 = colors[0]        || COLORS.cyan;
    const color2 = colors[1]        || COLORS.orange;
    const color3 = colors[2]        || COLORS.blue;
    const color4 = colors[3]        || COLORS.pink;

    return function (x, y, dt) {
        const new_angle = 90 + Math.abs((5 * dt + angle) % 180 - 90);
        dict['angle'] = new_angle;
        return texture_caireTiling(dict);
    };                     
}

function yin_yang(dict) {
    const r = dict['radius']      || 150;
    const center = dict['center'] || []
    const center_x = center[0]    || 250;
    const center_y = center[1]    || 250;
    const colors = dict['colors'] || [];
    const color1 = colors[0]      || COLORS.black;
    const color2 = colors[1]      || COLORS.white;
    const color_bg = colors[2]    || COLORS.cyan;

    const square = (x) => x * x;

    return function (x, y, dt) {
        const center_x_up = center_x + (r / 2) * Math.sin(dt);
        const center_y_up = center_y - (r / 2) * Math.cos(dt);
        const center_x_down = center_x - (r / 2) * Math.sin(dt);
        const center_y_down = center_y + (r / 2) * Math.cos(dt);

        if(square(x - center_x) + square(y - center_y) < square(r)) {
            if (square(x - center_x_up) + square(y - center_y_up) < square(r / 4))
                return color1;
            else if (square(x - center_x_down) + square(y - center_y_down) < square(r / 4))
                return color2;
            else if (square(x - center_x_up) + square(y - center_y_up) < square(r / 2))
                return color2;
            else if (square(x - center_x_down) + square(y - center_y_down) < square(r / 2))
                return color1;
            else if (Math.sin(dt) * (y - center_y) + Math.cos(dt) * (x - center_x) > 0)
                return color1;
            else
                return color2;
        }
        return color_bg; 
    };
}

//exports.chromatic_circle = chromatic_circle;