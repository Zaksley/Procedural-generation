'use strict';

/* Filter : cyan-coloration (example)
 *
 * @param intens intensity of the recoloration
 * @precond intens must be between 0 and 1
 * @return texture recolored in cyan
 */
function filter_cyanColoration(dict) {

	const intensity = dict['intensity']	|| 1;

	return function (img) {
		let data = img;
		for (let i = 0; i < img.length; i++) {
			data[i] = (i % 4 === 3 || i % 4 === 2)
				? data[i]
				: ((i % 4 === 1)
					? (1 - intensity / 2) * (data[i])
					: (1 - intensity) * data[i]);
		}
		return data;
	};
}

/* Filter : rotation
 *
 * @param width canvas width
 * @param angle angle of the gradient (0: horizontal left-to-right)
 * @precond angle must be between 0 and 360
 * @return clockwise-rotated texture (use negative angles for counter-clockwise rotations)
 */
function filter_rotation(dict) {

	const width = dict['width']			|| WIDTH;
	const angle = dict['angle'] 		|| 45;

	return function (img) {

		let data = [];
		data.length = img.length;
		const height = data.length / (4 * width);
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

/* Filter : invert color
 *
 * @return texture with inverted colors 
 */
function filter_invertColor(img) {
	let data = img;
	for (let i = 0; i < data.length; i++) {
		if (i % 4 !== 3)
			data[i] = 255 - img[i];
	}
	return data;
}

/* Filter : blur
 *
 * @param width canvas width
 * @param height canvas height
 * @param d distance of blurring
 * @return blurred texture
 */
function filter_blur(dict) {

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

/* Filter : detect outline
 *
 * @param width canvas width
 * @param d outline thickness
 * @param s sensivity
 * @param color outline color
 * @return outlined texture
*/
function filter_detectOutline(dict) {

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

function filter_compose(dict) {

	const operation = dict['operation'] || 'plus';
	let op = (e) => (e);
	let D = 1;
	switch(operation) {
		case 'plus': 
			op = ((a,b) => (a + b < 255) ? a + b : 255); 
			break;
		case 'minus': 
			op = ((a,b) => (a - b > 0) ? a - b : 0); 
			break;
		case 'multiply': 
			op = ((a,b) => (a/255)*(b/255)*255); 
			break;
		case 'screen': 
			op = ((a,b) => (1 - (1 - a/255)*(1 - b/255))*255); 
			break;
		case 'divide': 
			op = ((a,b) => (b > 0) ? ((a/255) / (b/255))*255 : 255); 
			break;
		case 'modplus': 
			op = ((a,b) => (a + b)%256); 
			break;
		case 'modminus': 
			op = ((a,b) => (255 + a - b)%256); 
			break;
		case 'differ':
			op = ((a,b) => (a - b > 0) ? a - b : b - a);
			break;
		case 'exclude':
			op = ((a,b) => (a + b - 2*(a*b)/255));
			break;
		case 'lighten':
			op = ((a,b) => (a > b) ? a : b);
			break;
		case 'darken':
			op = ((a,b) => (a < b) ? a : b);
			break;
		case 'hardlighten':
			op = ((a,b) => (a < 128) ? 2*(a*b)/255 : (255 + (1 - (2*(1-a/255)*(1-b/255)*255)))%256 );
			break;
		case 'softlighten':
			D = (a) => (a < 64) ? ((16*a - 12) * a + 4) * a : Math.sqrt(a) ;
			op = ((a,b) => (a < 128) ? ((a/255) - (1 - 2*b/255)*(a/255)*(1-a/255))*255 : (a/255 + (2*b/255 - 1)*(D(a/255) - a/255))*255 );
			break;
		default: 
			op = ((a,b) => (a + b)%256); 
			break;
	}

	return function(img, img2) {
		return img.map((e,i) => (i%4 === 3) ? 255 : op(e, img2[i]));
	}; 
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

/* Filter : color channel separation
 *
 * @param width image width
 * @param height image height
 * @param c channel id (r,g,b)
 * @return the filtered image
 */
function filter_getRGBChannel(dict) {

	const c = dict['c'] 			|| 'r';
	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;
	let v = 0;

	switch(c) {
		case 'r': v = 0; break;
		case 'g': v = 1; break;
		case 'b': v = 2; break;
	}

	return function(img) {
		return img.map((e,i) => (i%4===3) ? 255 : ((i%4===v) ? e : img[(i-i%4)+v]) );
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
		if(i%4 === 0) return red[i];
		if(i%4 === 1) return green[i];
		return blue[i];
	}
	return red.map((e,i) => (i%4===3) ? 255 : selectChannel(i));
}

/* Filter : HSL channel separation
 *
 * @param width image width
 * @param height image height
 * @param c channel id (h,s,l)
 * @return the filtered image
 */
function filter_getHSLChannel(dict) {

	const c = dict['c'] 			|| 'l';
	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;

	return function(img) {
		let data = img.slice();
		let val = 0, delta = 0, maxColor = 0, minColor = 0, medColor = 0;
		let pixel = [];

		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {

				pixel = Float32Array.from(img.slice((y*width + x)*4, (y*width + x)*4+3));
				pixel = pixel.map(e => e/255);
				maxColor = pixel.reduce((acc, el) => (el > acc) ? el : acc, 0);
				minColor = pixel.reduce((acc, el) => (el < acc) ? el : acc, 1);
				delta = maxColor - minColor;

				if(c === 'h')
					// medColor = pixel.reduce((acc, el) => (el !== maxColor && el !== minColor) ? acc+el : acc, 0);
					switch(maxColor){
						case pixel[0]: val = ((pixel[1]-pixel[2])/(delta)); break;
						case pixel[1]: val = 2 + (pixel[2]-pixel[0])/(delta); break;
						case pixel[2]: val = 4 + (pixel[0]-pixel[1])/(delta); break;
					}
					val = ((val*60 + 360)%360)/360;
				if(c === 's')
					//val = (maxColor - minColor === 0) ? 0 : ((maxColor - minColor)/);
					val = Math.max((maxColor - minColor) / (maxColor + minColor), 1);
				if(c === 'l')
					//val = pixel.reduce((acc, el) => acc+el, 0)/3;
					val = (maxColor + minColor)/2;
				for(let k = 0; k < 3; k++) {
					data[(y*width + x)*4 + k] = val*255;
					data[(y*width + x)*4 + 3] = 255; 
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
		const C = S*(1 - Math.abs(2*L - 1) );
		const X = C*(1 - Math.abs((H/60)%2 - 1) );
		const m = L - C/2;

		let Rp = 0, Gp = 0, Bp = 0;
		if(H < 180){
			if(H < 60){
				Rp = C; Gp = X, Bp = 0;
			}else if(H < 120){
				Rp = X, Gp = C, Bp = 0;
			}else{
				Rp = 0, Gp = C, Bp = X;
			}
		}else{
			if(H < 240){
				Rp = 0, Gp = X, Bp = C;
			}else if(H < 300){
				Rp = X, Gp = 0, Bp = C;
			}else{
				Rp = C, Gp = 0, Bp = X;
			}
		}

		switch(c) {
			case 0: return 255*(Rp+m);
			case 1: return 255*(Gp+m);
			case 2: return 255*(Bp+m);
		}
	}

	return hue.map((e,i) => (i%4===3) ? 255 : HSLtoRGB(360*e/256, sat[i]/256, lum[i]/256, i%4) );
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

	let acc = [0,0,0];
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

			acc = [0,0,0];
			for(let i = 0; i < mask.length; i++) {
				for(let j = 0; j < mask[0].length; j++) {
					for(let k = 0; k < 3; k++) {

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
			data[(y*width + x)*4 + 3] = 255;

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
function filter_box_blur(dict) {
	
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
function filter_gaussian_blur(dict) {
	
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
function filter_gaussian_unsharp_masking(dict) {
	
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
function filter_unsharp_masking(dict) {

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

/* Filter : Adjust luminosity
 * 
 * @param width image width
 * @param height image height
 * @param intensity the luminosity multiplicator
 * @return the filtered image
 */
function filter_luminosity(dict) {

	const l = dict['intensity']		|| 1.2;

	return function(img) {
		const H = filter_getHSLChannel({c:'h'})(img);
		const S = filter_getHSLChannel({c:'s'})(img);
		const L = filter_getHSLChannel({c:'l'})(img);
		const Lp = L.map((e,i) => (i%4===3) ? 255 : Math.min(255, l*e));
		return gatherHSLChannels(H,S,Lp);
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

	const s = dict['intensity']		|| 1.2;

	return function(img) {
		const H = filter_getHSLChannel({c:'h'})(img);
		const S = filter_getHSLChannel({c:'s'})(img);
		const L = filter_getHSLChannel({c:'l'})(img);
		const Sp = S.map((e,i) => (i%4===3) ? 255 : Math.min(255, s*e));
		return gatherHSLChannels(H,Sp,L);
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

	const h = dict['intensity']		|| 1.2;

	return function(img) {
		const H = filter_getHSLChannel({c:'h'})(img);
		const S = filter_getHSLChannel({c:'s'})(img);
		const L = filter_getHSLChannel({c:'l'})(img);
		const Hp = H.map((e,i) => (i%4===3) ? 255 : Math.min(255, h*e));
		return gatherHSLChannels(Hp,S,L);
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

	const c = dict['intensity']		|| 1.2;

	return function(img) {
		const cp = (c-1)*255;
		const F = 259*(cp + 255)/(255*(259 - cp));
		return img.map((e,i) => (i%4===3) ? 255 : (F*(e-128) + 128) );
	};
}

/* Filter : Conform/Anticonform transformation
 *
 * @param function An conform or anticonform transformation function
 * @return the filtered image
 */
function filter_conformTransformation(dict) {

	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;
	const fun = dict['function']	|| "x2";
	const colors = dict['colors']  	|| [];
    const color1 = dict['color1']   || colors[0] || COLORS.cyan;

    function shiftPos(e, max){
    	return Math.abs(e - max/2)/max;
    }
    function toPolar(a,b){
    	return [Math.sqrt(a**2 + b**2), Math.atan(b/a)];
    }
    function toEuclid(r,th){
    	return [r*Math.cos(th), r*Math.cos(th)];
    }

	function getAntecedent(i, j, method="solid") {
		let f = (e => e);
		let complex = 0;
		switch(fun) {
			case "sqrt": f = ((x,y) => [
				Math.floor(Math.sqrt(shiftPos(x,width)) * width), 
				Math.floor(Math.sqrt(shiftPos(y,height)) * height) 
				]); break;
			case "sqrt/2": f = ((x,y) => [
				Math.floor(Math.sqrt(shiftPos(x,width)) * width/2), 
				Math.floor(Math.sqrt(shiftPos(y,height)) * height/2) 
				]); break;
			case "x2": f = ((x,y) => [
				Math.floor(shiftPos(x,width)**2 * width), 
				Math.floor(shiftPos(y,height)**2 * height) 
				]); break;
			case "x22" : complex = toPolar(shiftPos(i,width), shiftPos(j,height));
				f = ((x,y) => toEuclid(
					Math.floor(complex[0]**2), 
					Math.floor(complex[1]*2)
				)); break;
			case "1/x": f = ((x,y) => [
				Math.floor(1/(shiftPos(x, width))),
				Math.floor(1/(shiftPos(y, height)))
				]); break;
			default: f = ((x,y) => [x,y]); break;
		}
		const transfo = f(i,j);
		return ((transfo[1]*width) + transfo[0])*4;
	}

	//Todo blur masking with jacobian

	return function(img) {
		let data = img.slice();
		for(let y = 0; y < height; y++) {
			for(let x = 0; x < width; x++) {
				for(let k = 0; k < 3; k++) {
					data[((y*width) + x)*4 + k] = img[getAntecedent(x,y) + k];
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

/*
exports.filter_cyanColoration = filter_cyanColoration;
exports.filter_rotation = filter_rotation;
exports.filter_horizontalFlip = filter_horizontalFlip;
exports.filter_verticalFlip = filter_verticalFlip;
exports.filter_invertColor = filter_invertColor;
exports.filter_blur = filter_blur;
exports.filter_detectOutline = filter_detectOutline;
*/