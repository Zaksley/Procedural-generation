'use strict';

/* Filter : cyan-coloration
 *
 * @param intens intensity of the recoloration
 * @precond intens must be between 0 and 1
 * @return texture recolored in cyan
 */
function filter_cyanColoration(intens) {
	return function (pixel) {
		return pixel.map((e,i) => (i===3)*e+(i===2)*e+(i===1)*(e/2));
	};
};

/* Filter : rotation
 *
 * @param angle angle of the gradient (0: horizontal left-to-right)
 * @precond angle must be between 0 and 360
 * @return clockwise-crotated texture (use negative angles for counter-clockwise rotations)
 */
function filter_rotation(angle) {
	return function (pixel) {
		//
	};
};

function filter_blur(img) {
    return function (width) {
    return function (height) {
    return function (d) {
	let s = [];
	for (let k = 0; k < width*height*4; k++)
	    s.push(0);
	const abs = (x) => (x > 0) ? x : -x;
	for (let y = 0, n = 0, m, nb_near; y < height; y++) {
	    for (let x = 0; x < width; x++, n+=4) {
		l = 0;
		for (let i = -d; i < d + 1; i++) {
		    for (let j = -d + abs(i); j < d - abs(i) + 1; j++) {
			m = (i*width + j)*4 + n;
			if (m > 0 && m < width*height*4) {
		            l++;
			    s[n] += img[m];
			    s[n+1] += img[m+1];
			    s[n+2] += img[m+2];
			    s[n+3] += img[m+3];
			}
		    }
		}
		s[n]   = Math.floor(s[n]/l); 
		s[n+1] = Math.floor(s[n+1]/l); 
		s[n+2] = Math.floor(s[n+2]/l); 
		s[n+3] = Math.floor(s[n+3]/l);
	    }
	}
	return s;
    }; }; };
};

// Todo filters :
// Rotation, horizontal/vertical flip, inversion, noise
