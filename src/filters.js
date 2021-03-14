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

// Todo filters :
// Rotation, horizontal/vertical flip, inversion, noise