/* Updates the image displayed (with current canvas, texture & dictionnary)
 */
function regenerateImage(){
	if (ANIMATION) {
		// Stop the Animation and reapply the new one
		ANIMATION = false;
		setTimeout(() => {
			ANIMATION = true;
			generateAnimation(CANVAS, window[TEXTURE](DICT));
		}, 100);
	}
	BASEDATA = generateTexture(CANVAS, window[TEXTURE](DICT));
	generateImage(CANVAS, BASEDATA);
};

/* Updates the image displayed with the display filters
 */
function regenerateFilters(){
	BASEDATA = generateTexture(CANVAS, window[TEXTURE](DICT), XOFFSET, YOFFSET);
	DATA = filter_resize(OPTDICT)(BASEDATA);
	generateImage(CANVAS, DATA);
};

/* Changes the label number to match the slider value 
 *
 * @param sliderValueId DOM Id of the slider value object
 * @param value new value
 */
function updateSliderValue(sliderValueId, value){
	document.getElementById(sliderValueId).innerHTML = value;
};

/* Converts a hexa string to a rgba array 
 *
 * @param hexa a hexa string (#[0-9A-Fa-f]{6})
 * @return a rgba 4-array
 */
function hexaToRGBA(hexa){
	let rgb = [hexa.substr(1,2),hexa.substr(3,2),hexa.substr(5,2)];
	rgba = rgb.map((e) => parseInt(e.substr(0,1), 16)*16 + parseInt(e.substr(1,1), 16));
	rgba.push(255);
	return rgba;
};

/* Generates an image in the canvas from the textarea
 */
function generateHTMLImageFromJson(){
	// Parsing
	let data = '{' + document.getElementById("textarea").value + '}';
	let jsondata = {};
	let error = false;
	try {
		JSON.parse(data);
	} catch (e) {
		error = true;
		document.getElementById('jsonerror').innerHTML = "Parsing error: " + e;
		document.getElementById('jsonerror').style.display = "block";
	} finally {
		if(error === false) {
			jsondata = JSON.parse(data);
			document.getElementById('jsonerror').style.display = "none";
		} else {
			return;
		}
	}

	// Transformation
	error = false;
	try { 
		img = generateArrayFromJson(jsondata);
	} catch(e) {
		error = true;
		document.getElementById('jsonerror').innerHTML = e;
		document.getElementById('jsonerror').style.display = "block";
	} finally {
		if(error === false) {
			jsondata = JSON.parse(data);
			document.getElementById('jsonerror').style.display = "none";
		} else {
			return;
		}
	}

	// Image generation
	generateImage(CANVAS, img);
}

/* Displays all options for the selected texture functions
 *
 * @param value the texture function (without 'texture_')
 */
function showTextureOptions(value){
	// Stop the Animation and then continue
	ANIMATION = false;
	setTimeout(() => {

	// Gathering options
	let options = [];
	switch(value){
		// General
			case "solid": 				options = ["color1"]; break;
			case "horizontalGradient": 	options = ["columns", "fullangle", "color1", "color2"]; break;
			case "star": 				options = ["size", "branches", "centerx", "centery", "color1", "color2"]; break;
			case "regularShape": 		options = ["size", "branches", "centerx", "centery", "color1", "color2"]; break;
		// Regular tilings
			case "triangleTiling": 		options = ["size", "color1", "color2"]; break;
			case "hexagonTiling": 		options = ["size", "color1", "color2", "color3"]; break;
		// Semi-regular tilings
			case "3Dcube": 				options = ["size", "color1", "color2", "color3"]; break;
			case "3DgambarTiling": 		options = ["size", "color1", "color2", "color3"]; break;
			case "elongatedTriangular": options = ["size", "color1", "color2", "color3", "color4"]; break;
			case "snubSquare": 			options = ["size", "color1", "color2", "color3"]; break;
			case "snubHexagonal": 		options = ["size", "color1", "color2", "color3"]; break;
			case "truncatedSquare": 	options = ["size", "color1", "color2", "color3"]; break;
			case "truncatedHexagon": 	options = ["size", "color1", "color2", "color3", "color4"]; break;
			case "3DgambarTiling": 		options = ["size", "color1", "color2", "color3"]; break;
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
        	case "squareFractal":    	options = ["depth", "color1", "color2"]; break;
        	case "triangularFractal":   options = ["depth", "color1", "color2"]; break;
      // Cellular Automata
         case "forestFire":          options = ["treeP", "lightP", "step"]; break;
         case "gameOfLife":          options = ["step"]; break;
		 case "Greenberg_Hastings":	 options = ["step"]; break;
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
			case "sdIsocelesTriangle":    options = ["size", "size2", "centerx", "centery", "color1"]; break;
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
			case "chromaticCircle":      	ANIMATION = true; options = ["size", "centerx", "centery"]; break;
			case "yinyang":      			ANIMATION = true; options = ["size", "centerx", "centery", "color1", "color2"]; break;
			case "randomFunction": 			ANIMATION = true; options = []; break;
			case "ForestFire":				ANIMATION = true; options = []; break;
			case "GameOfLife":				ANIMATION = true; options = []; break;
			case "GreenbergHastings":		ANIMATION = true; options = []; break;
			case "rain":						ANIMATION = true; options = []; break;
		default: 					options = []; break;
	}

	if (ANIMATION) {
		TEXTURE = "animated_" + value;
		console.log("Switching to " + value + " animation ...");
		generateAnimation(CANVAS, window[TEXTURE](DICT));
	} else {
		TEXTURE = "texture_" + value;
		console.log("Switching to " + value + " texture ...");
		// Generating default texture
		regenerateImage();
	}

	// Displaying options
	Array.from(document.getElementsByClassName("textureOption")).forEach(function(e, i){
		e.style.display = "none";
	});
	options.forEach(function(e, i){
		document.getElementsByClassName(e)[0].style.display = "block";
	});
	}, 100);
};

/* Prevents usage of TAB to exit the textarea, indent code instead
 */
// Todo add shift+tab ?
document.getElementById("textarea").addEventListener('keydown', function(e) {
	if(e.key == 'Tab') {
		e.preventDefault();
		let start = this.selectionStart;
		let end = this.selectionEnd;

		// Indent whole block of code
		let linesBetween = this.value.substring(start, end).split('\n');
		let newBlock = "";
		for(let i = 0; i < linesBetween.length; i++) {
			if(i > 0) newBlock += '\n';
			newBlock += "\t" + linesBetween[i];
		};

		// Updates value
		this.value = this.value.substring(0, start) 
			+ newBlock 
			+ this.value.substring(end);

		// Moves cursor
		this.selectionStart = start + 1;
		this.selectionEnd = end + linesBetween.length;
	};
});
