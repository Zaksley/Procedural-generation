'use strict';

const globalVars = require('../vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;
const COLORS = globalVars.COLORS;

const color_tools = require('./color_filters.js');
const filter_greyScale = color_tools.greyScale;
const filter_getHSLChannel = color_tools.getHSLChannel;
const gatherHSLChannels = color_tools.gatherHSLChannels;

/* Filter : simple blur
 *
 * @param width canvas width
 * @param height canvas height
 * @param d distance of blurring
 * @return blurred texture
 */
function filter_simpleBlur(dict) {

	const width = dict['width'] 		|| WIDTH;
	const height = dict['height'] 		|| HEIGHT;
	const d = dict['intensity']			|| 5;

	return function (img) {
		let s = [];
		for (let k = 0; k < width * height * 4; k++)
			s.push(0);
		const abs = (x) => (x > 0) ? x : -x;
		for (let y = 0, n = 0, m, nb_near; y < height; y++) {
			for (let x = 0; x < width; x++, n += 4) {
				nb_near = 0;
				for (let i = -d; i < d + 1; i++) {
					for (let j = -d + abs(i); j < d - abs(i) + 1; j++) {
						m = (i * width + j) * 4 + n;
						if (m > 0 && m < width * height * 4) {
							nb_near++;
							s[n] += img[m];
							s[n + 1] += img[m + 1];
							s[n + 2] += img[m + 2];
							s[n + 3] += img[m + 3];
						}
					}
				}
				s[n] = Math.floor(s[n] / nb_near);
				s[n + 1] = Math.floor(s[n + 1] / nb_near);
				s[n + 2] = Math.floor(s[n + 2] / nb_near);
				s[n + 3] = Math.floor(s[n + 3] / nb_near);
			}
		}
		return s;
	};
}

/* Filter : amplify outlines
 *
 * @param width canvas width
 * @param d outline thickness
 * @param s sensivity
 * @param color outline color
 * @return outlined texture
*/
function filter_amplifyOutlines(dict) {

	const width = dict['width'] 		|| WIDTH;
	const s = dict['sensivity'] 		|| 5;
	const d = dict['intensity']			|| 5;
	const colors = dict['colors'] 		|| [];
	const color = dict['color1'] 		|| colors[0] || COLORS.cyan;

	return function (img) {
		let data = [];
		data.length = img.length;
		const height = img.length / (4 * width);
		for (let i = 0, n = 0; i < height; i++) {
			for (let j = 0; j < width; j++, n += 4) {
				let cond = true;
				for (let k = 0; k < 4; k++) {
					if (j + 1 < width && Math.abs(img[n + k] - img[n + k + 4]) > s
						|| j > 0 && Math.abs(img[n + k] - img[n + k - 4]) > s
						|| i + 1 < height && Math.abs(img[n + k] - img[n + 4 * width + k]) > s
						|| i > 0 && Math.abs(img[n + k] - img[n - 4 * width + k]) > s)
						cond = false;
				}
				for (let l = -d; l < d + 1; l++) {
					for (let m = -d + Math.abs(l); m < d + 1 - Math.abs(l); m++) {
						for (let k = 0; k < 4; k++) {
							if (!cond)
								data[n + 4 * l + 4 * m * width + k] = color[k];
						}
					}
				}
				if (cond && [data[n], data[n + 1], data[n + 2], data[n + 3]] !== color)
					[data[n], data[n + 1], data[n + 2], data[n + 3]] = [img[n], img[n + 1], img[n + 2], img[n + 3]];
			}
		}
		return data;
	};
}

/* Generates a gaussian blur mask
 * @param r the mask radius
 * @param stdev standard deviation
 * @return a (2*r+1) length normalized mask
 */ 
function gaussianMask(r, stdev) {
	const len = 2*r + 1;
	const V = stdev**2;
	let mask = new Array(len).fill().map(() => Array(len).fill(0));

	for(let i = 0; i < len; i++) {
		for(let j = 0; j < len; j++) {
			mask[i][j] = Math.exp( -(((i-r)**2 + (j-r)**2) / (2*V) ) ) / (2*Math.PI*V);
		}
	}
	const sum = mask.reduce((acc, e) => acc + e.reduce((acc2, e2) => acc2+e2), 0);
	return mask.map(e => e.map(e2 => e2/sum));
}

/* Applies a convolution filter to an image
 * 
 * @param img an image data array
 * @param width the image width
 * @param height the image height
 * @param mask the applied mask
 * @param method the edge management method
 * @return the filtered image
 */
function applyMask(img, width, height, mask, method="extension") {
	let data = img.slice();
	const maskLenX = Math.floor(mask.length/2);
	const maskLenY = Math.floor(mask[0].length/2);

	let acc = [0,0,0,0];
	let imgIndex = 0, col = 0, row = 0;
	let leftHl = 0, rightHl = 0, topHl = 0, bottomHl = 0;

	// Edge management method
	function getEdge(xval, yval) {
		switch(method) {
			// Extend the last pixel
			case "extension":
				leftHl = 0;
				rightHl = width-1;
				topHl = 0;
				bottomHl = height-1;
			break;

			// Wrapping all the way round
			case "wrapping":
				leftHl = xval+width;
				rightHl = xval-width;
				topHl = yval+height;
				bottomHl = yval-height;
			break;

			// Mirroring base image
			case "mirror":
				leftHl = -xval;
				rightHl = 2*width-1-xval;
				topHl = -yval;
				bottomHl = 2*height-1-yval;
			break;
		}
	}

	for(let y = 0; y < height; y++) {
		for(let x = 0; x < width; x++) {

			acc = [0,0,0,0];
			for(let i = 0; i < mask.length; i++) {
				for(let j = 0; j < mask[0].length; j++) {
					for(let k = 0; k < 4; k++) {

						// Get handler values
						getEdge(y+i-maskLenY, x+j-maskLenX);

						if(y+i-maskLenY >= 0) {
							if(y+i-maskLenY < width)
								col = y+i-maskLenY;
							else col = rightHl;
						} else col = leftHl;

						if(x+j-maskLenX >= 0) {
							if(x+j-maskLenX < height)
								row = x+j-maskLenX;
							else row = bottomHl;
						} else row = topHl;

						imgIndex = ((col)*width + row)*4 + k;
						acc[k] += mask[i][j]*img[imgIndex];
					}
				}
			}

			data[(y*width + x)*4] 	  = Math.abs(acc[0]);
			data[(y*width + x)*4 + 1] = Math.abs(acc[1]);
			data[(y*width + x)*4 + 2] = Math.abs(acc[2]);
			data[(y*width + x)*4 + 3] = Math.abs(acc[3]);

		}
	}
	return data;
}

/* Filter : Sobel outline detection
 * 
 * @param width image width
 * @param height image height
 * @return the filtered image
 */
function filter_sobel(dict) {

	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;

	return function(img) {
		const data = filter_greyScale({})(img);
		const horizontalMask = [[-1,0,1],[-2,0,2],[-1,0,1]];
		const verticalMask = [[-1,-2,-1],[0,0,0],[1,2,1]];

		const Gx = applyMask(data, width, height, horizontalMask);
		const Gy = applyMask(data, width, height, verticalMask);
		return Gx.map((e,i) => (i%4 === 3) ? 255 : 255*Math.sqrt((e/255)**2 + (Gy[i]/255)**2));
	};
}

/* Filter : Canny outline detection
 * 
 * @param width image width
 * @param height image height
 * @param low the lower tresholding boundary
 * @param high the higher tresholding boundary
 * @return the filtered image
 */
// TODO gaussian filter size in parameters
function filter_canny(dict) {

	const lowTreshold = dict['low']   || 0.01;
	const highTreshold = dict['high'] || 0.1;
	const width = dict['width'] 	  || WIDTH;
	const height = dict['height'] 	  || HEIGHT;

	return function(img) {
	
		// Gaussian mask example :
		//let noiseReductionMask = [[2,4,5,4,2],[4,9,12,9,4],[5,12,15,12,5],[4,9,12,9,4],[2,4,5,4,2]];
		//noiseReductionMask = noiseReductionMask.map(e => e.map(e2 => e2/159));
		const noiseReductionMask = gaussianMask(2, 1.4);
		const horizontalMask = [[-1,0,1]];
		const verticalMask = [[1],[0],[-1]];

		// Noise reduction
		let data = filter_greyScale({})(img);
		data = applyMask(data, width, height, noiseReductionMask);

		// Gradient mapping
		const Gx = applyMask(data, width, height, horizontalMask);
		const Gy = applyMask(data, width, height, verticalMask);
		const G = Gx.map((e,i) => (i%4 === 3) ? 255 : Math.sqrt(e**2 + Gy[i]**2));

		// Non-maxima deletion
		function isLocalMaxima(e, i) {
			if(e >= G[i-4] && e >= G[i+4] && e >= G[i-(width)*4] && e >= G[i+(width)*4])
				return true;
			return false;
		}
		data = G.map((e,i) => (i%4 === 3) ? 255 : (isLocalMaxima(e, i) ? e : 0) );

		// Outline tresholding (Hysteresis filter)
		let accepted = new Array(G.length/4).fill(0);
		function tresholding(e, i) {
			if(e >= highTreshold) {
				accepted[i] = 1;
				return 255;
			} else if(e >= lowTreshold) {
				if(accepted[i-1] === 1 || accepted[i-width] === 1) {
					accepted[i] = 1;
					return 255;
				}
			}
			return 0;
		}
		const O = data.map((e,i) => (i%4 === 3) ? 255 : tresholding(e/255, (i-i%4)/4) );
		return O;
	};
}

/* Filter : Sharpness enhancement
 * 
 * @param width image width
 * @param height image height
 * @param intensity the filter intensity
 * @return the filtered image
 */
function filter_sharpness(dict) {
	
	const ity = dict['intensity']   || 1;
	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;

	return function(img) {
		const mask = [[0,-ity,0],[-ity,1+4*ity,-ity],[0,-ity,0]];
		return applyMask(img, width, height, mask);
	};
}

/* Filter : Normalized box blur
 * 
 * @param width image width
 * @param height image height
 * @param radius the mask radius
 * @return the filtered image
 */
function filter_boxBlur(dict) {
	
	const radius = dict['radius'] 	|| 1;
	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;

	return function(img) {
		const len = 2*radius + 1;
		const mask = new Array(len).fill().map(() => Array(len).fill(1/(len**2)));
		return applyMask(img, width, height, mask);
	};
}

/* Filter : Gaussian blur
 * 
 * @param width image width
 * @param height image height
 * @param radius the mask radius
 * @param stdev mask standard deviation
 * @return the filtered image
 */
function filter_gaussianBlur(dict) {
	
	const radius = dict['radius'] 	|| 1;
	const stdev = dict['stdev'] 	|| 1.4;
	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;

	return function(img) {
		const mask = gaussianMask(radius, stdev);
		return applyMask(img, width, height, mask);
	};
}

/* Filter : Unsharp masking (Gaussian method)
 * 
 * @param width image width
 * @param height image height
 * @param radius the mask radius
 * @param stdev mask standard deviation
 * @return the filtered image
 */
function filter_gaussianUnsharpMasking(dict) {
	
	const radius = dict['radius'] 	|| 1;
	const stdev = dict['stdev'] 	|| 1.4;
	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;

	return function(img) {
		let mask = gaussianMask(radius, stdev).map(e => e.map(e2 => -e2));
		mask[radius][radius] = 2 - mask[radius][radius];

		// Implementation choice : using the mask only on the luminosity channel
		// Resulting in less variation errors than applying it on rgb channels
		const H = filter_getHSLChannel({c:'h'})(img);
		const S = filter_getHSLChannel({c:'s'})(img);
		const L = filter_getHSLChannel({c:'l'})(img);
		const Lp = applyMask(L, width, height, mask);
		
		return gatherHSLChannels(H, S, Lp);
	};
}

/* Filter : Unsharp masking (Linear method)
 * 
 * @param width image width
 * @param height image height
 * @return the filtered image
 */
function filter_unsharpMasking(dict) {

	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;

	return function(img) {
		const identity = [[0,0,0],[0,1,0],[0,0,0]];
		const sharpeningMask = [[0,1,0],[1,-4,1],[0,1,0]];
		const unsharpMask = identity.map((e,i) => e.map((e2,i2) => e2 - sharpeningMask[i][i2]) );
		
		// Application of the mask on separate channels
		// Because this is a "simple" mask, the choice is on color channels (done automatically by applyMask)
		// (see gaussian_unsharp_masking for more)
		return applyMask(img, width, height, unsharpMask);
	};
}

// Exports
exports.gaussianMask 	= gaussianMask;
exports.applyMask 		= applyMask;
exports.canny 			= filter_canny;
exports.sobel 			= filter_sobel;
exports.sharpness 		= filter_sharpness;
exports.simpleBlur 		= filter_simpleBlur;
exports.boxBlur 		= filter_boxBlur;
exports.gaussianBlur 	= filter_gaussianBlur;
exports.unsharpMasking 			= filter_unsharpMasking;
exports.gaussianUnsharpMasking 	= filter_gaussianUnsharpMasking;
exports.amplifyOutlines = filter_amplifyOutlines;