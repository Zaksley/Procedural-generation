'use strict';

const globalVars = require('../vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;
const COLORS = globalVars.COLORS;

/* Filter : rotation
 *
 * @param width canvas width
 * @param angle angle of the gradient (0: horizontal left-to-right)
 * @precond angle must be between 0 and 360
 * @return clockwise-rotated texture (use negative angles for counter-clockwise rotations)
 */
function filter_rotation(dict) {

	const width = dict['width']			|| WIDTH;
	const height = dict['height']		|| HEIGHT;
	const angle = dict['angle'] 		|| 45;

	return function (img) {

		let data = [];
		data.length = img.length;
		//const height = data.length / (4 * width);
		let x_init, y_init;
		let r, angle_init;
		let x, y;
		for (let i = 0, n = 0, m; i < height; i++) {
			for (let j = 0; j < width; j++, n += 4) {
				if (img[n + 3] !== 0) {
					x_init = j - width / 2 + 1;
					y_init = i - height / 2 + 1;
					if (Math.abs(x_init) > Math.abs(y_init))
						r = Math.abs(x_init) * Math.sqrt(1 + y_init * y_init / (x_init * x_init));
					else
						r = Math.abs(y_init) * Math.sqrt(1 + x_init * x_init / (y_init * y_init));
					if (r === 0) {
						x = Math.round(width / 2);
						y = Math.round(height / 2);
					} else {
						if (y_init < 0)
							angle_init = -Math.acos(x_init / r);
						else
							angle_init = Math.acos(x_init / r);
						x = Math.round(r * Math.cos(angle_init + angle * Math.PI / 180) + width / 2);
						y = Math.round(r * Math.sin(angle_init + angle * Math.PI / 180) + height / 2);
					}
					if (x >= 0 && x < width && y >= 0 && y < height) {
						m = (x + y * width) * 4;
						data[m] = img[n];
						data[m + 1] = img[n + 1];
						data[m + 2] = img[n + 2];
						data[m + 3] = img[n + 3];
					}
				}
			}
		}
		return data;
	};
}

/* Filter : horizontal flip
 *
 * @param width canvas width
 * @return texture flipped horizontally
 */
function filter_horizontalFlip(dict) {

	const width = dict['width'] 		|| WIDTH;

	return function (img) {
		let data = [];
		data.length = img.length;
		const height = data.length / (4 * width);
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width * 4; j++) {
				data[i * width * 4 + j] = img[(height - 1 - i) * width * 4 + j];
			}
		}
		return data;
	};
}

/* Filter : vertical flip
 *
 * @param width canvas width
 * @return texture flipped vertically
 */
function filter_verticalFlip(dict) {

	const width = dict['width'] 		|| WIDTH;

	return function (img) {
		let data = [];
		data.length = img.length;
		const height = data.length / (4 * width);
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				data[(i * width + j) * 4] = img[((i + 1) * width - j) * 4 - 4];
				data[(i * width + j) * 4 + 1] = img[((i + 1) * width - j) * 4 - 3];
				data[(i * width + j) * 4 + 2] = img[((i + 1) * width - j) * 4 - 2];
				data[(i * width + j) * 4 + 3] = img[((i + 1) * width - j) * 4 - 1];
			}
		}
		return data;
	};
}

/* Filter : inverted colors / negative image
 *
 * @return texture with inverted colors 
 */
function filter_negativeImage(img) {
	let data = img;
	for (let i = 0; i < data.length; i++) {
		if (i % 4 !== 3)
			data[i] = 255 - img[i];
	}
	return data;
}

/* Filter : gray scale
 *
 * @param width image width
 * @param height image height
 * @return the filtered image
 */
function filter_greyScale(dict) {

	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;

	return function(img) {
		let data = img.slice();
		let val = 0;
		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {
				val = Math.floor(img.slice((y*width + x)*4, (y*width + x)*4+3).reduce((acc, el) => acc+el, 0)/3);
				for(let k = 0; k < 3; k++) {
					data[(y*width + x)*4 + k] = val;
					data[(y*width + x)*4 + 3] = 255; 
				}
			}
		}
		return data;
	};
}

/* Filter : zoom
 *
 * @param width image width
 * @param height image height
 * @param n zoom intensity
 */
function filter_resize(dict) {

	const width = dict['width']		|| WIDTH;
	const height = dict['height']	|| HEIGHT;
	const n = dict['intensity']		|| 10;

	return function(img) {
		let data = [];
		data.length = img.length;

		for (let i = 0; i < Math.floor(height/n)+1; i++) {
			for (let j = 0; j < Math.floor(width/n)+1; j++) {

				for (let i2 = 0; i2 < n; i2++) {
					if(i*n + i2 >= height) break;
					for (let j2 = 0; j2 < n; j2++) {
						if(j*n + j2 >= width) break;
						data[(i2 + n*i)*width*4 + (j2 + n*j)*4] = img[i*height*4 + j*4];
						data[(i2 + n*i)*width*4 + (j2 + n*j)*4 + 1] = img[i*height*4 + j*4 + 1];
						data[(i2 + n*i)*width*4 + (j2 + n*j)*4 + 2] = img[i*height*4 + j*4 + 2];
						data[(i2 + n*i)*width*4 + (j2 + n*j)*4 + 3] = img[i*height*4 + j*4 + 3];
					}
				}
			}
		}

		return data;
	};
}

/* Filter : replace color with another
 *
 * @param width replacement width
 * @param height replacement height
 * @param offsetx replacement horizontal start
 * @param offsety replacement vertical start
 * @return the image with first color replaced by the other in a rectangle
 */
function filter_replaceColor(dict) {

	const width = dict['width']			|| WIDTH;
	const height = dict['height']		|| HEIGHT;
	const x_offset = dict['offsetx'] 	|| 0;
	const y_offset = dict['offsety'] 	|| 0;
	const colors = dict['colors']   || [];
    const color1 = dict['color1']   || colors[0] || COLORS.blue;
    const color2 = dict['color2']   || colors[1] || COLORS.cyan;
    const maxheight = (height + y_offset > height) ? height - y_offset : height;
    const maxwidth = (width + x_offset > width) ? width - x_offset : width;

	return function(img) {
		let data = img.slice();
		for(let y = y_offset; y < maxheight; y++) {
			for(let x = x_offset; x < maxwidth; x++) {
				if(img[(y*width + x)*4] === color1[0] && img[(y*width + x)*4+1] === color1[1]
				&& img[(y*width + x)*4+2] === color1[2] && img[(y*width + x)*4+3] === color1[3]) {
					for(let k = 0; k < 4; k++)
						data[(y*width + x)*4 + k] = color2[k];
				}
			}
		}
		return data;
	};
}
// Exports
exports.rotation 			= filter_rotation;
exports.horizontalFlip 		= filter_horizontalFlip;
exports.verticalFlip 		= filter_verticalFlip;
exports.negativeImage 		= filter_negativeImage;
exports.greyScale 			= filter_greyScale;
exports.resize 				= filter_resize;
exports.replaceColor 		= filter_replaceColor;