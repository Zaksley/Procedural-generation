'use strict';

const globalVars = require('../vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;

/* Double filter : composition
 *
 * @param operation the operation between the two images
 * @return the filtered image
 */
function dfilter_compose(dict) {

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
		return img.map((e,i) => op(e, img2[i])); //(i%4 === 3) ? 255 : op
	}; 
}

/* Double filter : overwriting
 *
 * @return an image where img2 overwrites img
 */
function dfilter_paste() {

	return function(img, img2) {
		function coverColor(bottom, top, intensity) {
			const newcolor = (top + bottom*intensity);
			return (newcolor > 255) ? 255 : newcolor;
		}
		return img.map((e,i) => (i%4 === 3) ? (e+img2[i] > 255 ? 255 : e+img2[i]) : coverColor(e, img2[i], 1-(img2[i-i%4+3]/255)) );
	};

}

/* Double filter : cutting
 *
 * @returns an image where img2 has been cut into img
 */
function dfilter_cut() {
	return function(img, img2) {
		function cutColor(bottom, top, intensity) {
			const newcolor = (bottom - top*intensity);
			if(intensity === 0) return 0;
			return (newcolor < 0) ? 0 : newcolor;
		}
		return img.map((e,i) => (i%4 === 3) ? (e-img2[i] < 0 ? 0 : e-img2[i]) : cutColor(e, img2[i], 1-(img2[i-i%4+3]/255)) );
	};
}

/* Function : reduce *  
 * @param dict.w original width of the image 
 * @param dict.h original height of the image 
 * @param dict.r number of rows 
 * @param dict.c number of columns 
 * @return an image at the size (w / c) * (h / r) 
 */
function reduce_image(dict) {
	const w = dict['width']  || WIDTH;
	const h = dict['height'] || HEIGHT;
	const r = dict['rows'] 	 || 3;
	const c = dict['columns']|| 3;

	return function (img) {
		let data = [];
		let color;
		const size_x = Math.floor(w / c);
		const size_y = Math.floor(h / r);

		function avgColor(x, y) {
			let color = [0, 0, 0, 0];
			for(let i = 0; i < c; i++)
				for(let j = 0; j < r; j++)
					color = color.map((e, k) => e + img[(x * c + i + (y * r + j) * w) * 4 + k] / (r * c));
			return color;
		}

		for(let i = 0; i < size_x; i++) {
			for(let j = 0; j < size_y; j++) {
				color = avgColor(i, j);
				for(let k = 0; k < 4; k++) {
					data[(i + j * size_x) * 4 + k] = color[k];
				}
			}
		}
		return data;	
	};
}

/* filter : galery
 * 
 * @param images an array of images
 * @return an image which is a galery of image
 */
function dfilter_galery(dict) {
	const w = dict['width']  || WIDTH;
	const h = dict['height'] || HEIGHT;
	let none = new Uint8ClampedArray(w * h * 4).fill(0);

	return function(...images) {
		console.log(images);
		const n = Math.max(images.length, 1);
		let c = Math.ceil(Math.sqrt(n));
		let r = Math.floor(Math.sqrt(n));
		r = (c * r < n) ? r + 1: r;
		[r, c] = h > w ? [c, r] : [r, c];

		const size_x = Math.floor(w / c);
		const size_y = Math.floor(h / r);

		let data = [];
		let imgs = images.map((e) => reduce_image({width: w, height: h, rows: r, columns: c})(e));

		if (c * r > n) {
			none = reduce_image({width: w, height: h, rows: r, columns: c})(none);
			imgs.length = c * r;
			imgs.fill(none, n, c * r);
		}

		for(let i = 0; i < w; i++) {
			for(let j = 0; j < h; j++) {
				for(let k = 0; k < 4; k++) {
					data[(i + j * w) * 4 + k] = imgs[Math.min(Math.floor(i / size_x), c - 1) + Math.min(Math.floor(j / size_y), r - 1) * c][(i % size_x + (j % size_y) * size_x) * 4 + k];
				}
			}
		}
		return data;
	};
}

// Exports
exports.compose = dfilter_compose;
exports.paste = dfilter_paste;
exports.cut = dfilter_cut;
exports.galery = dfilter_galery;