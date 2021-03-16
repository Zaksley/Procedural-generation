function pavage_chess(image){
    return (width) => (height) => (color1) => (color2) => (row) => (column) => (x, y) => { 
	if ((x%(2*Math.floor(width/column)) < Math.ceil(width/column))) {
	    if ((y%(2*Math.floor(height/row)) < Math.ceil(height/row)))
		color1;
	    else 
		color2;
	}
	if ((y%(2*Math.floor(height/row)) < Math.ceil(height/row)))
	    color1;
	else 
	    color2;
    }
}
