'use strict';

/* Filter : cyan-coloration (example)
 *
 * @param intens intensity of the recoloration
 * @precond intens must be between 0 and 1
 * @return texture recolored in cyan
 */
function filter_cyanColoration(img) {
	return function (intens) {
		let data = img;
		for (let i = 0; i < img.length; i++) {
			data[i] = (i % 4 === 3 || i % 4 === 2)
				? data[i]
				: ((i % 4 === 1)
					? (1 - intens / 2) * (data[i])
					: (1 - intens) * data[i]);
		}
		return data;
	}
}

/* Filter : rotation
 *
 * @param width canvas width
 * @param angle angle of the gradient (0: horizontal left-to-right)
 * @precond angle must be between 0 and 360
 * @return clockwise-rotated texture (use negative angles for counter-clockwise rotations)
 */
function filter_rotation(img) {
	return function (width) {
		return function (angle) {
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
		}
	}
}

/* Filter : horizontal flip
 *
 * @param width canvas width
 * @return texture flipped horizontally
 */
function filter_horizontalFlip(img) {
	return function (width) {
		let data = [];
		data.length = img.length;
		const height = data.length / (4 * width);
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width * 4; j++) {
				data[i * width * 4 + j] = img[(height - 1 - i) * width * 4 + j];
			}
		}
		return data;
	}
}

/* Filter : vertical flip
 *
 * @param width canvas width
 * @return texture flipped vertically
 */
function filter_verticalFlip(img) {
	return function (width) {
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
	}
}

/* Filter : invert color
 *
 * @return texture with inverted colors 
 */
function filter_invertColor(img) {
	let data = img;
	for (let i = 0; i < data.length; i++) {
		if (i % 4 != 3)
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
function filter_blur(img) {
	return function (width) {
		return function (height) {
			return function (d) {
				let s = [];
				for (let k = 0; k < width * height * 4; k++)
					s.push(0);
				const abs = (x) => (x > 0) ? x : -x;
				for (let y = 0, n = 0, m, nb_near; y < height; y++) {
					for (let x = 0; x < width; x++, n += 4) {
						let l = 0;
						for (let i = -d; i < d + 1; i++) {
							for (let j = -d + abs(i); j < d - abs(i) + 1; j++) {
								m = (i * width + j) * 4 + n;
								if (m > 0 && m < width * height * 4) {
									l++;
									s[n] += img[m];
									s[n + 1] += img[m + 1];
									s[n + 2] += img[m + 2];
									s[n + 3] += img[m + 3];
								}
							}
						}
						s[n] = Math.floor(s[n] / l);
						s[n + 1] = Math.floor(s[n + 1] / l);
						s[n + 2] = Math.floor(s[n + 2] / l);
						s[n + 3] = Math.floor(s[n + 3] / l);
					}
				}
				return s;
			}
		}
	}
}

/* Filter : detect outline
 *
 * @param width canvas width
 * @param d outline thickness
 * @param s sensivity
 * @param color outline color
 * @return outlined texture
*/
function filter_detectOutline(img) {
	return function (width) {
		return function (d) {
			return function (s) {
				return function (color) {
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
							if (cond && [data[n], data[n + 1], data[n + 2], data[n + 3]] != color)
								[data[n], data[n + 1], data[n + 2], data[n + 3]] = [img[n], img[n + 1], img[n + 2], img[n + 3]];
						}
					}
					return data;
				}
			}
		}
	}
}

// Todo filters :
// Flip, noise (? quoi faire dans noise)
