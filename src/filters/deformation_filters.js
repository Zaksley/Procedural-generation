'use strict';

const globalVars = require('../vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;
//const COLORS = globalVars.COLORS;

/* Filter : Conform/Anticonform transformation
 *
 * @param function An conform or anticonform transformation function
 * @return the filtered image
 */
function filter_conformTransformation(dict) {

	const width = dict['width'] 	|| WIDTH;
	const height = dict['height'] 	|| HEIGHT;
	const fun = dict['function']	|| "x2";
	//const colors = dict['colors']  	|| [];
    //const color1 = dict['color1']   || colors[0] || COLORS.cyan;

    function shiftPos(e, max){
		return Math.abs(e - max/2)/max;
    }
	function toPolar(a,b){
		return [Math.sqrt(a**2 + b**2), Math.atan(b/a)];
    }
	function toEuclid(r,th){
		return [r*Math.cos(th), r*Math.cos(th)];
    }

	function getAntecedent(i, j) { // method="solid"
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
			// Not working ----
			case "x22" : complex = toPolar(shiftPos(i,width), shiftPos(j,height));
				f = (() => toEuclid(
					Math.floor(complex[0]**2), 
					Math.floor(complex[1]*2)
				)); break;
			// ----------------
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

// Exports
exports.conformTransformation = filter_conformTransformation;