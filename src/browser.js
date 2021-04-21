/* Updates the image displayed (with current canvas, texture & dictionnary)
 */
function regenerateImage(){
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
	TEXTURE = "texture_" + value;
	console.log("Switching to " + value + " texture ...");
	// Generating default texture
	regenerateImage();

	// Gathering options
	let options = [];
	switch(value){
		// General
			case "solid": 				options = ["color1"]; break;
			case "horizontalGradient": 	options = ["columns", "color1", "color2"]; break;
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
        // Diagrams todo
        	case "Voronoi":             options = ["germs"]; break;
        	case "squareFractal":    	options = ["depth", "color1", "color2"]; break;
        	case "triangularFractal":   options = ["depth", "color1", "color2"]; break;
        // Cellular Automata
            case "forestFire":          options = ["treeP", "lightP", "step"]; break;
            case "gameOfLife":          options = ["step"]; break;
		// Animations todo

		default: 					options = []; break;
	};

	// Displaying options
	Array.from(document.getElementsByClassName("textureOption")).forEach(function(e, i){
		e.style.display = "none";
	});
	options.forEach(function(e, i){
		document.getElementsByClassName(e)[0].style.display = "block";
	});
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