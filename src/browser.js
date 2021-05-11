'use strict';

// Global variables
const globalVars = require('./vars.js');
const WIDTH = globalVars.WIDTH;
const HEIGHT = globalVars.HEIGHT;

// Main utility functions
const main = require('./main_func.js');
const generateImage = main.generateImage;
const generateTexture = main.generateTexture;
const generateAnimation = main.generateAnimation;
const generateArrayFromJson = main.generateArrayFromJson;

// Setting the window environment
window.hexaToRGBA = hexaToRGBA;
window.regenerateImage = regenerateImage;
window.regenerateFilters = regenerateFilters;
window.updateSliderValue = updateSliderValue;
window.generateHTMLImageFromJson = generateHTMLImageFromJson;
window.showTextureOptions = showTextureOptions;
window.getRule = main.getRule;
for(const key in globalVars){
	window[key] = globalVars[key];
}
for(const key in main){
	window[key] = main[key];
}

// Setting Canvas properties
const CANVAS = document.getElementById("canvas");
window.CANVAS = CANVAS;
CANVAS.width = WIDTH;
CANVAS.height = HEIGHT;

// Global vars - Web-specific
let DATA = [], BASEDATA = [];
let TEXTURE = "";
let DICT = window.DICT;
let OPTDICT = {intensity:1, translation:0};
let XOFFSET = 0, YOFFSET = 0;


/* Updates the image displayed (with current canvas, texture & dictionnary)
 */
function regenerateImage(){
	if (window.ANIMATION) {
		// Stop the Animation and reapply the new one
		window.ANIMATION = false;
		setTimeout(() => {
			window.ANIMATION = true;
			generateAnimation(CANVAS, window["ANIMATIONS"][TEXTURE](DICT));
		}, 100);
	} else {
		BASEDATA = generateTexture(CANVAS, window["TEXTURES"][TEXTURE](DICT));
		generateImage(CANVAS, BASEDATA);
	}
}

/* Updates the image displayed with the display filters
 */
function regenerateFilters(){
	BASEDATA = generateTexture(CANVAS, window["TEXTURES"][TEXTURE](DICT), XOFFSET, YOFFSET);
	DATA = window["FILTERS"]["resize"](OPTDICT)(BASEDATA);
	generateImage(CANVAS, DATA);
}

/* Changes the label number to match the slider value 
 *
 * @param sliderValueId DOM Id of the slider value object
 * @param value new value
 */
function updateSliderValue(sliderValueId, value){
	document.getElementById(sliderValueId).innerHTML = value;
}

/* Converts a hexa string to a rgba array 
 *
 * @param hexa a hexa string (#[0-9A-Fa-f]{6})
 * @return a rgba 4-array
 */
function hexaToRGBA(hexa){
	let rgb = [hexa.substr(1,2),hexa.substr(3,2),hexa.substr(5,2)];
	let rgba = rgb.map((e) => parseInt(e.substr(0,1), 16)*16 + parseInt(e.substr(1,1), 16));
	rgba.push(255);
	return rgba;
}

/* Generates an image in the canvas from the textarea
 */
function generateHTMLImageFromJson(){
	// Parsing
	let data = '{' + document.getElementById("textarea").value + '}';
	let jsondata = {};
	let img = []; 
	let error = false;
	try {
		jsondata = JSON.parse(data);
	} catch (e) {
		error = true;
		document.getElementById('jsonerror').innerHTML = "Parsing error: " + e;
		document.getElementById('jsonerror').style.display = "block";
	}
	if(error === false) {
		document.getElementById('jsonerror').style.display = "none";
	} else {
		return 0;
	}

	// Transformation
	error = false;
	try { 
		img = generateArrayFromJson(CANVAS, jsondata);
	} catch(e) {
		error = true;
		document.getElementById('jsonerror').innerHTML = e;
		document.getElementById('jsonerror').style.display = "block";
	}
	if(error === false) {
		document.getElementById('jsonerror').style.display = "none";
	} else {
		return 0;
	}

	// Image generation
	generateImage(CANVAS, img);
	return 1;
}

/* Displays all options for the selected texture functions
 *
 * @param value the texture function (without 'texture_')
 */
function showTextureOptions(value){

	// Stop the Animation and then continue
	window.ANIMATION = false;
	setTimeout(() => {

	// Gathering options
	let options = [];
	switch(value){
		// General
			case "solid": 				options = ["color1"]; break;
			case "horizontalGradient": 	options = ["columns", "fullangle", "color1", "color2"]; break;
			case "star": 				options = ["size", "branches", "centerx", "centery", "color1", "color2"]; break;
			case "regularShape": 		options = ["size", "branches", "centerx", "centery", "color1", "color2"]; break;
			case "disk": 				options = ["size", "centerx", "centery", "color1", "color2"]; break;
			case "circle": 				options = ["size", "outline", "centerx", "centery", "color1", "color2"]; break;
		// Regular tilings
			case "triangleTiling": 		options = ["size", "color1", "color2"]; break;
			case "hexagonTiling": 		options = ["size", "color1", "color2", "color3"]; break;
		// Semi-regular tilings
			case "cubeTiling": 			options = ["size", "color1", "color2", "color3"]; break;
			case "gambarTiling": 		options = ["size", "color1", "color2", "color3"]; break;
			case "elongatedTriangular": options = ["size", "color1", "color2", "color3", "color4"]; break;
			case "snubSquare": 			options = ["size", "color1", "color2", "color3"]; break;
			case "snubHexagonal": 		options = ["size", "color1", "color2", "color3"]; break;
			case "truncatedSquare": 	options = ["size", "color1", "color2", "color3"]; break;
			case "truncatedHexagon": 	options = ["size", "color1", "color2", "color3", "color4"]; break;
			case "smallRhombitrihexagonalTiling": 	options = ["size", "color1", "color2", "color3"]; break;
			case "bigRhombitrihexagonalTiling": 	options = ["size", "color1", "color2", "color3"]; break;
			case "trihexagonal": 		options = ["size", "color1", "color2"]; break;
		// Non-regular tilings
			case "squareTiling": 		options = ["rows", "columns"]; break;
			case "caireTiling": 		options = ["size", "angle", "color1", "color2", "color3", "color4"]; break;
			case "pentagonTiling3":		options = ["size", "angle", "color1", "color2", "color3"]; break;
			case "pentagonTiling4":		options = ["size", "size2", "angle", "color1", "color2", "color3", "color4"]; break;
      // Noise maps todo
			case "limitedWhiteNoise": 	options = ["rows", "columns"]; break;
			case "perlinNoise": 		options = ["rows", "columns", "color1", "color2", "color3"]; break;
		// Diagrams todo
			case "Voronoi":             options = ["germs"]; break;
			case "squareFractal": 		options = ["depth", "color1", "color2"]; break;
			case "triangularFractal": 	options = ["depth", "color1", "color2"]; break;
		// Cellular Automata
         case "forestFire":          options = ["treeP", "lightP", "step"]; break;
         case "gameOfLife":          options = ["step"]; break;
			case "Greenberg_Hastings": 	options = ["step"]; break;
        case "elementaryCellularAutomaton":          options = ["rule"]; break;
        case "cyclic1DCellularAutomaton":          options = ["color1", "color2", "color3", "color4"]; break;
		// Signed Distance Textures
			case "sdCircle": 					options = ["size", "centerx", "centery", "color1"]; break;
         case "sdBox":       				options = ["size", "size2", "centerx", "centery", "color1"]; break;
         case "sdRoundedBox":        	options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdOrientedBox":       	options = ["size", "size2", "fullangle", "centerx", "centery", "color1"]; break;
			case "sdSegment":      			options = ["size", "size2", "fullangle", "centerx", "centery", "color1"]; break;
			case "sdRhombus":      			options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdIsoscelesTrapezoid":  options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdParallelogram": 		options = ["size", "size2", "distance", "centerx", "centery", "color1"]; break;
			case "sdEquilateralTriangle": options = ["size", "centerx", "centery", "color1"]; break;
			case "sdIsoscelesTriangle":   options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdTriangle":    			options = ["color1"]; break;
			case "sdUnevenCapsule":      	options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdRegularPentagon":     options = ["size", "centerx", "centery", "color1"]; break;
			case "sdRegularHexagon":      options = ["size", "centerx", "centery", "color1"]; break;
			case "sdRegularOctogon":      options = ["size", "centerx", "centery", "color1"]; break;
			case "sdHexagram":     			options = ["size", "centerx", "centery", "color1"]; break;
			case "sdStar5":     				options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdRegularStar":     		options = ["size", "branches", "branches2", "centerx", "centery", "color1"]; break;
			case "sdPie":      				options = ["size", "fullangle", "centerx", "centery", "color1"]; break;
			case "sdArc":       				options = ["size", "size2", "fullangle", "fullangle2", "centerx", "centery", "color1"]; break;
			case "sdHorseshoe":      		options = ["size", "size2", "size3", "fullangle", "centerx", "centery", "color1"]; break;
			case "sdVesica":      			options = ["size", "size2", "distance", "centerx", "centery", "color1"]; break; 
			case "sdMoon":      				options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdSimpleEgg":      		options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdHeart":      			options = ["size", "centerx", "centery", "color1"]; break;
			case "sdCross":       			options = ["size", "size2", "size3", "centerx", "centery", "color1"]; break;
			case "sdCircleCross":       	options = ["size", "centerx", "centery", "color1"]; break;
			case "sdBobblyCross":      	options = ["size", "centerx", "centery", "color1"]; break;
			case "sdRoundedX":      		options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdPolygon":      			options = ["branches", "color1"]; break;
			case "sdEllipse":      			options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdParabola":      		options = ["size", "centerx", "centery", "color1"]; break;
			case "sdParabolaSegment":     options = ["size", "size2", "centerx", "centery", "color1"]; break;
			case "sdQuadraticBezier":     options = ["color1"]; break;
		// Animations todo
			case "chromaticCircle":      	window.ANIMATION = true; options = ["size", "centerx", "centery"]; break;
			case "yinyang":      			window.ANIMATION = true; options = ["size", "centerx", "centery", "color1", "color2"]; break;
			case "randomFunction": 			window.ANIMATION = true; options = []; break;
			case "ForestFire":				window.ANIMATION = true; options = []; break;
			case "GameOfLife":				window.ANIMATION = true; options = ["config"]; break;
			case "GreenbergHastings":		window.ANIMATION = true; options = []; break;
			case "rain":						window.ANIMATION = true; options = []; break;
		default: 					options = []; break;
	}

	if (ANIMATION) {
		TEXTURE = value;
		console.log("Switching to " + value + " animation ...");
		generateAnimation(CANVAS, window["ANIMATIONS"][TEXTURE](DICT));
	} else {
		TEXTURE = value;
		console.log("Switching to " + value + " texture ...");
		// Generating default texture
		regenerateImage();
	}

	// Displaying options
	Array.from(document.getElementsByClassName("textureOption")).forEach(function(e){
		e.style.display = "none";
	});
	options.forEach(function(e){
		document.getElementsByClassName(e)[0].style.display = "block";
	});
	}, 100);
}

/* Prevents usage of TAB to exit the textarea, indent code instead
 */
// Todo add shift+tab ?
document.getElementById("textarea").addEventListener('keydown', function(e) {
	if(e.key === 'Tab') {
		e.preventDefault();
		let start = this.selectionStart;
		let end = this.selectionEnd;

		// Indent whole block of code
		let linesBetween = this.value.substring(start, end).split('\n');
		let newBlock = "";
		for(let i = 0; i < linesBetween.length; i++) {
			if(i > 0) newBlock += '\n';
			newBlock += "\t" + linesBetween[i];
		}

		// Updates value
		this.value = this.value.substring(0, start) 
			+ newBlock 
			+ this.value.substring(end);

		// Moves cursor
		this.selectionStart = start + 1;
		this.selectionEnd = end + linesBetween.length;
	}
});
