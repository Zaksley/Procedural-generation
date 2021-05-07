'use strict';

/* Double filter : composition
 *
 * @param operation the operation between the two images
 * @return the filtered image
 */
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

// Exports
exports.compose = filter_compose;