'use strict';

function solid(i, j)
{
    return [0, 0, 0, 255]; 
}

function gradient_Horizontal(i, j)
{
    return [Math.floor(255*j/height), Math.floor(255*j/height), Math.floor(255*j/height), 255];
}

function gradient_Vertical(i, j)
{
    return [Math.floor(255*i/width), Math.floor(255*i/width), Math.floor(255*i/width), 255];
}


function regulatePavage_square(i, j, nbSquare_x, nbSquare_y)
{
    let sizeSquare_x = width/nbSquare_x; 
    let sizeSquare_y = height/nbSquare_y;

    let coordinate_x = Math.floor(i/sizeSquare_x);
    let coordinate_y = Math.floor(j/sizeSquare_y);

    if (coordinate_x % 2 == 0 && coordinate_y  % 2 != 0)   return [255, 255, 255, 255]; 
    if (coordinate_x % 2 != 0 && coordinate_y  % 2 == 0)   return [255, 255, 255, 255]; 

    return [0, 0, 0, 255]; 
}