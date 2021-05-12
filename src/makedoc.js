'use strict';

// Global variables
const main = require('./main_func.js');
const fs = require('fs');
const textures = main.textures_func;
const filters = main.filters_func;
const dfilters = main.doublefilters_func;

function getParams(func) {
	let options = [];
	switch(func){
		// General & Shapes
			case "solid": 					options = ["color1"]; break;
			case "horizontalGradient": 		options = ["columns", "fullangle", "color1", "color2"]; break;
			case "star": 					options = ["size", "branches", "centerx", "centery", "color1", "color2"]; break;
			case "doubleStar": 				options = ["size","size2","branches","centerx","centery","color1","color2"]; break;
			case "regularShape": 			options = ["size", "branches", "centerx", "centery", "color1", "color2"]; break;
			case "disk": 					options = ["size", "centerx", "centery", "color1", "color2"]; break;
			case "circle": 					options = ["size", "outline", "centerx", "centery", "color1", "color2"]; break;
			case "testInShape":				options = ["coords"]; break;
			case "tileBoard":			options = ["size", "columns", "rows", "color1", "color2"]; break;
		// Regular tilings
			case "triangleTiling": 			options = ["size", "color1", "color2"]; break;
			case "hexagonTiling": 			options = ["size", "color1", "color2", "color3"]; break;
		// Semi-regular tilings
			case "cubeTiling": 				options = ["size", "color1", "color2", "color3"]; break;
			case "gambarTiling": 			options = ["size", "color1", "color2", "color3"]; break;
			case "elongatedTriangular": 	options = ["size", "color1", "color2", "color3", "color4"]; break;
			case "snubSquare": 				options = ["size", "color1", "color2", "color3"]; break;
			case "snubHexagonal": 			options = ["size", "color1", "color2", "color3"]; break;
			case "truncatedSquare": 		options = ["size", "color1", "color2", "color3"]; break;
			case "truncatedHexagon": 		options = ["size", "color1", "color2", "color3", "color4"]; break;
			case "smallRhombitrihexagonalTiling": 	options = ["size", "color1", "color2", "color3"]; break;
			case "bigRhombitrihexagonalTiling": 	options = ["size", "color1", "color2", "color3"]; break;
			case "trihexagonal": 			options = ["size", "color1", "color2"]; break;
		// Non-regular tilings
			case "squareTiling": 			options = ["rows", "columns"]; break;
			case "caireTiling": 			options = ["size", "angle", "color1", "color2", "color3", "color4"]; break;
			case "pentagonTiling3":			options = ["size", "angle", "color1", "color2", "color3"]; break;
			case "pentagonTiling4":			options = ["size", "size2", "angle", "color1", "color2", "color3", "color4"]; break;
      // Noise maps todo
			case "limitedWhiteNoise": 		options = ["rows", "columns"]; break;
			case "perlinNoise": 			options = ["rows", "columns", "color1", "color2", "color3"]; break;
		// Diagrams todo
			case "Voronoi":             	options = ["germs"]; break;
			case "squareFractal": 			options = ["depth", "color1", "color2"]; break;
			case "triangularFractal": 		options = ["depth", "color1", "color2"]; break;
		// Cellular Automata
			case "forestFire":          	options = ["treeP", "lightP", "step"]; break;
			case "gameOfLife":          	options = ["step"]; break;
			case "Greenberg_Hastings": 		options = ["step"]; break;
			case "elementaryCellularAutomaton":          options = ["rule"]; break;
			case "cyclic1DCellularAutomaton":   options = ["color1", "color2", "color3", "color4"]; break;
		// Signed Distance Textures
			case "sdCircle": 				options = ["size", "centerx", "centery", "color1"]; break;
			case "sdBox":       			options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdRoundedBox":        	options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdOrientedBox":       	options = ["size", "size2", "fullangle", "centerx", "centery", "color1"]; break;
			case "sdSegment":      			options = ["size", "size2", "fullangle", "centerx", "centery", "color1"]; break;
			case "sdRhombus":      			options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdIsoscelesTrapezoid":  	options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdParallelogram": 		options = ["size", "size2", "distance", "centerx", "centery", "color1"]; break;
			case "sdEquilateralTriangle": 	options = ["size", "centerx", "centery", "color1"]; break;
			case "sdIsoscelesTriangle":   	options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdTriangle":    			options = ["color1"]; break;
			case "sdUnevenCapsule":      	options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdRegularPentagon":     	options = ["size", "centerx", "centery", "color1"]; break;
			case "sdRegularHexagon":      	options = ["size", "centerx", "centery", "color1"]; break;
			case "sdRegularOctogon":      	options = ["size", "centerx", "centery", "color1"]; break;
			case "sdHexagram":     			options = ["size", "centerx", "centery", "color1"]; break;
			case "sdStar5":     			options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdRegularStar":     		options = ["size", "branches", "branches2", "centerx", "centery", "color1"]; break;
			case "sdPie":      				options = ["size", "fullangle", "centerx", "centery", "color1"]; break;
			case "sdArc":       			options = ["size", "size2", "fullangle", "fullangle2", "centerx", "centery", "color1"]; break;
			case "sdHorseshoe":      		options = ["size", "size2", "size3", "fullangle", "centerx", "centery", "color1"]; break;
			case "sdVesica":      			options = ["size", "size2", "distance", "centerx", "centery", "color1"]; break; 
			case "sdMoon":      			options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdSimpleEgg":      		options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdHeart":      			options = ["size", "centerx", "centery", "color1"]; break;
			case "sdCross":       			options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdCircleCross":       	options = ["size", "centerx", "centery", "color1"]; break;
			case "sdBobblyCross":      		options = ["size", "centerx", "centery", "color1"]; break;
			case "sdRoundedX":      		options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdPolygon":      			options = ["branches", "color1"]; break;
			case "sdEllipse":      			options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdParabola":      		options = ["size", "centerx", "centery", "color1"]; break;
			case "sdParabolaSegment":     	options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdQuadraticBezier":     	options = ["color1"]; break;


		// Filters
			case "rotation": 				options = ["width","height","angle"]; break;
			case "horizontalFlip": 			options = ["width"]; break;
			case "verticalFlip": 			options = ["width"]; break;
			case "negativeImage": 			options = []; break;
			case "greyScale": 				options = ["width","height"]; break;
			case "resize": 					options = ["width","height","intensity"]; break;
			case "replaceColor": 			options = ["width","height","offsetx","offsety","color1","color2"]; break;
			case "canny": 					options = ["width","height","low","high"]; break;
			case "sobel": 					options = ["width","height"]; break;
			case "sharpness": 				options = ["width","height","intensity"]; break;
			case "simpleBlur": 				options = ["width","height","intensity"]; break;
			case "boxBlur": 				options = ["width","height","radius"]; break;
			case "gaussianBlur": 			options = ["width","height","radius","stdev"]; break;
			case "unsharpMasking": 			options = ["width","height"]; break;
			case "gaussianUnsharpMasking":	options = ["width","height","radius","stdev"]; break;
			case "amplifyOutlines": 		options = ["width","sensitivity","intensity","color1"]; break;
			case "getRGBChannel": 			options = ["c"]; break;
			case "getHSLChannel": 			options = ["c"]; break;
			case "luminosity": 				options = ["intensity"]; break;
			case "saturation": 				options = ["intensity"]; break;
			case "hueShift": 				options = ["intensity"]; break;
			case "contrast": 				options = ["intensity"]; break;
			case "conformTransformation":	options = ["width","height","function"]; break;

		// Double filters
			case "compose": 				options = ["operation"]; break;
			default: options = []; break;
	}
	return options;
}

// Doc header
let buffer = "---------------------------\n";
buffer += "Procedural textures library\n";
buffer += "------ Documentation ------\n\n";

// Textures
buffer += "============================ TEXTURES ============================\n\n";

for(let i = 0; i < textures.length; i++) {
	buffer += textures[i] + ":\n";
	const params = getParams(textures[i]);
	for(let key in params){
		buffer += "\t- " + params[key] + "\n";
	}
	buffer += "\n";
}

buffer += "\n";

// Filters
buffer += "============================ FILTERS ============================\n\n";

for(let i = 0; i < filters.length; i++) {
	buffer += filters[i] + ":\n";
	const params = getParams(filters[i]);
	for(let key in params){
		buffer += "\t- " + params[key] + "\n";
	}
	buffer += "\n";
}

// Double filters
buffer += "========================= DOUBLE FILTERS =========================\n\n";

for(let i = 0; i < dfilters.length; i++) {
	buffer += dfilters[i] + ":\n";
	const params = getParams(dfilters[i]);
	for(let key in params){
		buffer += "\t- " + params[key] + "\n";
	}
	buffer += "\n";
}

// Write in file
fs.writeFileSync("documentation.md", buffer);
