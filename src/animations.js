/* Transformation : circle
 * 
 * @param dict.radius circle radius
 * @param dict.freq rotation frequency
 * @return a function (x, y, dt) returning an array of coordinates
 */
function circle(dict) {
    const r = dict['radius']   || 100;
    const freq = dict['freq']  || 25;

    return ((x, y, dt) => [x + r * Math.cos(Math.PI * 2 * dt / freq), y + r * Math.sin(Math.PI * 2 * dt / freq)]);
}

/* Transformation : rotation
 * 
 * @param dict.borders canvas width and height
 * @param dict.center rotation center
 * @param dict.angle rotation starting angle
 * @param dict.function a function (angle, dt) returning an angle
 * @return a function (x, y, dt) returning an array of coordinates
 */
function rotation(dict) {
    const borders = dict['borders'] || [];
    const width = borders[0]        || 0;
    const height = borders[1]       || 0;
    const center = dict['center']   || [];
    const center_x = center[0]      || width / 2;
    const center_y = center[1]      || height / 2;
    const angle = dict['angle']     || 0;
    const func = dict['function']   || ((angle, dt) => angle + 0 * dt);

    return function(x, y, dt) {
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
    const bd_x = borders[0]         || 0;
    const bd_y = borders[1]         || 0;
    const v_x = dict['x_speed']     || 0;
    const v_y = dict['y_speed']     || 0;

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
    const texture = dict['texture'] || texture_solid({});
    const func = dict['function'] || [];

    return function(x, y, dt) {
        let new_x = x, new_y = y;
        // apply transformations 
        for (let i = 0; i < func.length; i++)
            [new_x, new_y] = func[i](new_x, new_y, dt);

        return texture(new_x, new_y, dt);
    };
}

function chromatic_circle(dict) {
    const r = dict['radius']      || 150;
    const center = dict['center'] || [];
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
    //const size = dict['size']       || 50;
    const angle = dict['size']      || 135;
    //const colors = dict['colors']   || [];
    //const color1 = colors[0]        || COLORS.cyan;
    //const color2 = colors[1]        || COLORS.orange;
    //const color3 = colors[2]        || COLORS.blue;
    //const color4 = colors[3]        || COLORS.pink;

    return function (x, y, dt) {
        const new_angle = 90 + Math.abs((5 * dt + angle) % 180 - 90);
        dict['angle'] = new_angle;
        return texture_caireTiling(dict)(x, y);
    };                     
}

function yin_yang(dict) {
    const r = dict['radius']      || 150;
    const rot = dict['rotation']  || 0;
    const center = dict['center'] || [];
    const center_x = center[0]    || 250;
    const center_y = center[1]    || 250;
    const colors = dict['colors'] || [];
    const color1 = colors[0]      || COLORS.black;
    const color2 = colors[1]      || COLORS.white;
    const color_bg = colors[2]    || COLORS.cyan;

    const square = (x) => x * x;

    return function (x, y, dt) {
        const time = rot * dt;

        const center_x_up = center_x + (r / 2) * Math.sin(time);
        const center_y_up = center_y - (r / 2) * Math.cos(time);
        const center_x_down = center_x - (r / 2) * Math.sin(time);
        const center_y_down = center_y + (r / 2) * Math.cos(time);

        if(square(x - center_x) + square(y - center_y) < square(r)) {
            if (square(x - center_x_up) + square(y - center_y_up) < square(r / 4))
                return color1;
            else if (square(x - center_x_down) + square(y - center_y_down) < square(r / 4))
                return color2;
            else if (square(x - center_x_up) + square(y - center_y_up) < square(r / 2))
                return color2;
            else if (square(x - center_x_down) + square(y - center_y_down) < square(r / 2))
                return color1;
            else if (Math.sin(time) * (y - center_y) + Math.cos(time) * (x - center_x) > 0)
                return color1;
            else
                return color2;
        }
        return color_bg; 
    };
}

//exports.chromatic_circle = chromatic_circle;