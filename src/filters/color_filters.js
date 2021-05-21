'use strict';

const globalVars = require('../vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;

/* Filter : color channel separation
 *
 * @param width image width
 * @param height image height
 * @param c channel id (r,g,b)
 * @return the filtered image
 */
function filter_getRGBChannel(dict) {
	const c = 	dict['c'] 	|| 'r';
	let v = 0;

	switch (c) {
		case 'r': 	v = 0; break;
		case 'g': 	v = 1; break;
		case 'b': 	v = 2; break;
	}

	return function (img) {
		return img.map((e, i) => (i % 4 === 3) ? 255 : ((i % 4 === v) ? e : img[(i - i % 4) + v]));
	};
}

/* Gathers separate images and select RGB channel values
 *
 * @param red grayscale image used as red channel
 * @param green grayscale image used as green channel
 * @param blue grayscale image used as blue channel
 * @return the merged image
 */
function gatherRGBChannels(red, green, blue) {
	function selectChannel(i) {
		if (i % 4 === 0) 
			return red[i];
		else if (i % 4 === 1) 
			return green[i];
		else
			return blue[i];
	}
	return red.map((e, i) => (i % 4 === 3) ? 255 : selectChannel(i));
}

/* Filter : HSL channel separation
 *
 * @param width image width
 * @param height image height
 * @param c channel id (h,s,l)
 * @return the filtered image
 */
function filter_getHSLChannel(dict) {
	const c = 		dict['c'] 		|| 'l';
	const width = 	dict['width'] 	|| WIDTH;
	const height = 	dict['height'] 	|| HEIGHT;

	return function (img) {
		let data = img.slice();
		let val = 0, delta = 0, maxColor = 0, minColor = 0;
		let pixel = [];

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				pixel = Float32Array.from(img.slice((y * width + x) * 4, (y * width + x) * 4 + 3));
				pixel = pixel.map(e => e / 255);
				maxColor = pixel.reduce((acc, el) => (el > acc) ? el : acc, 0);
				minColor = pixel.reduce((acc, el) => (el < acc) ? el : acc, 1);
				delta = maxColor - minColor;

				if (c === 'h') {
					switch (maxColor) {
						case pixel[0]: val = ((pixel[1] - pixel[2]) / (delta)); break;
						case pixel[1]: val = 2 + (pixel[2] - pixel[0]) / (delta); break;
						case pixel[2]: val = 4 + (pixel[0] - pixel[1]) / (delta); break;
					}
				}
				val = ((val * 60 + 360) % 360) / 360;
				if (c === 's')
					val = Math.max((maxColor - minColor) / (maxColor + minColor), 1);
				if (c === 'l')
					val = (maxColor + minColor) / 2;
				for (let k = 0; k < 3; k++) {
					data[(y * width + x) * 4 + k] = val * 255;
					data[(y * width + x) * 4 + 3] = 255;
				}
			}
		}
		return data;
	};
}

/* Gathers separate images by recomputing RGB channel from HSL values
 *
 * @param hue grayscale image used as hue channel
 * @param sat grayscale image used as saturation channel
 * @param lum grayscale image used as luminosity channel
 * @return the merged image
 */
function gatherHSLChannels(hue, sat, lum) {

	function HSLtoRGB(H, S, L, c) {
		const C = S * (1 - Math.abs(2 * L - 1));
		const X = C * (1 - Math.abs((H / 60) % 2 - 1));
		const m = L - C / 2;

		let Rp = 0, Gp = 0, Bp = 0;
		if (H < 180) {
			if (H < 60)
				Rp = C, Gp = X, Bp = 0;
			else if (H < 120)
				Rp = X, Gp = C, Bp = 0;
			else
				Rp = 0, Gp = C, Bp = X;
		} else {
			if (H < 240)
				Rp = 0, Gp = X, Bp = C;
			else if (H < 300)
				Rp = X, Gp = 0, Bp = C;
			else
				Rp = C, Gp = 0, Bp = X;
		}

		switch (c) {
			case 0:	return 255 * (Rp + m);
			case 1: return 255 * (Gp + m);
			case 2: return 255 * (Bp + m);
		}
	}

	return hue.map((e, i) => (i % 4 === 3) ? 255 : HSLtoRGB(360 * e / 256, sat[i] / 256, lum[i] / 256, i % 4));
}

/* Filter : Adjust luminosity
 * 
 * @param width image width
 * @param height image height
 * @param intensity the luminosity multiplicator
 * @return the filtered image
 */
function filter_luminosity(dict) {
	const l = 	dict['intensity'] 	|| 1.2;

	return function (img) {
		const H = filter_getHSLChannel({ c: 'h' })(img);
		const S = filter_getHSLChannel({ c: 's' })(img);
		const L = filter_getHSLChannel({ c: 'l' })(img);
		const Lp = L.map((e, i) => (i % 4 === 3) ? 255 : Math.min(255, l * e));
		return gatherHSLChannels(H, S, Lp);
	};
}

/* Filter : Adjust saturation
 * 
 * @param width image width
 * @param height image height
 * @param intensity the saturation multiplicator
 * @return the filtered image
 */
function filter_saturation(dict) {
	const s = 	dict['intensity'] 	|| 1.2;

	return function (img) {
		const H = filter_getHSLChannel({ c: 'h' })(img);
		const S = filter_getHSLChannel({ c: 's' })(img);
		const L = filter_getHSLChannel({ c: 'l' })(img);
		const Sp = S.map((e, i) => (i % 4 === 3) ? 255 : Math.min(255, s * e));
		return gatherHSLChannels(H, Sp, L);
	};
}

/* Filter : Hue shift
 * 
 * @param width image width
 * @param height image height
 * @param intensity the shift
 * @return the filtered image
 */
function filter_hueShift(dict) {
	const h = 	dict['intensity'] 	|| 1.2;

	return function (img) {
		const H = filter_getHSLChannel({ c: 'h' })(img);
		const S = filter_getHSLChannel({ c: 's' })(img);
		const L = filter_getHSLChannel({ c: 'l' })(img);
		const Hp = H.map((e, i) => (i % 4 === 3) ? 255 : Math.min(255, h * e));
		return gatherHSLChannels(Hp, S, L);
	};
}

/* Filter : Adjust contrast
 * 
 * @param width image width
 * @param height image height
 * @param intensity contrast shift
 * @return the filtered image
 */
function filter_contrast(dict) {
	const c = 	dict['intensity'] 	|| 1.2;

	return function (img) {
		const cp = (c - 1) * 255;
		const F = 259 * (cp + 255) / (255 * (259 - cp));
		return img.map((e, i) => (i % 4 === 3) ? 255 : (F * (e - 128) + 128));
	};
}

// Exports
exports.getRGBChannel 		= filter_getRGBChannel;
exports.gatherRGBChannels 	= gatherRGBChannels;
exports.getHSLChannel 		= filter_getHSLChannel;
exports.gatherHSLChannels 	= gatherHSLChannels;
exports.luminosity 			= filter_luminosity;
exports.saturation 			= filter_saturation;
exports.hueShift 			= filter_hueShift;
exports.contrast 			= filter_contrast;