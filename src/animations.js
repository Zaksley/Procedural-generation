function chromatic_circle(r){
    return function (center_x) {
    return function (center_y) {
    return function (x, y, dt) {
    
    const square = (x) => x*x;
    const abs = (x) => x > 0 ? x: -x;
    const f = (x) => abs(x%256-128);
    if (square(y-center_y) + square(x-center_x) < square(r))
	return [f(10*dt),f(3*dt),f(7*dt),255];
    else
	return [0, 0, 0, 255];
	}; }; };
};
