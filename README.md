# Procedural Generation Project
===============================

- [Project subject](https://www.labri.fr/perso/renault/working/teaching/projets/2020-21-S6-Scheme-Procedural.php)

- [Thor web page](https://thor.enseirb-matmeca.fr/ruby/projects/projetss6-proc)

# Authors
=========

_ENSEIRB-MATMECA Group n°128-30_

- M. Brassart 	<mathieu.brassart@enseirb-matmeca.fr>
- K. Dieu 		<killian.dieu@enseirb-matmeca.fr>
- L. Herau 		<perig.herau@enseirb-matmeca.fr>
- E. Medina 	<enzo.medina@enseirb-matmeca.fr>

# Installation & Usage
======================

- Make sure to have *node* installed on the computer
- Download and install the following modules : *browserify*, *canvas*, *jest*

## Web version
--------------

1. Installation
	- Write `make gen` in a terminal to create the web files

2. Usage
	- Open *public/index.html* in a web browser

	- Use the selector in the left section of the screen to choose a texture
	- Use the filters below to change the options

	- The **tree generator** can be used to visualize a JSON object on the page (see Input file format)

	- Write `make clear` to delete the web files and empty the directory


## Node version
---------------

1. Documentation
	- Write `make doc` in a terminal to get the documentation
	- Open the *documentation.md* file with a text reader

2. Usage
	- Write `node src/main.js [input file] [output name]` to generate an image
	- The input file must respect the syntax defined below (section "Input file format")
	- The output file will be a PNG image with the specified name

	- You can use `make example` to generate an example file *example.png*
	- The source json code used for this generation can be found in *example.txt*

3. Tests
	- Write `make test` in a terminal to launch the tests


## Input file format
--------------------

The input files are read with a JSON parser, and thus have to respect the ECMA-404 Json standard
The file opening and closing brackets are not needed

Simple example (texture & filter):

	"contrast": {
		"intensity":2,
		"hexagonTiling": {
		"color1":[128,255,128,255],
			"color3":"red"
		}
	}

Explanations:
- `contrast` calls the contrast enhancement **filter**, so it needs exactly one image in its parameters.
- `intensity` is one of the contrast parameters
- `hexagonTiling` is another parameter, and calls the hexagonal tiling **texture**, so it creates an image.
- `color1` and `color3` are the texture's parameters
- Both RGBA arrays ([r,g,b,a]) and color names (strings) can be used as colors. Use "0" for a transparent color.


Advanced example (double filter, color replacement, texture duplicata):

	"paste": {
		"disk": {
			"color1": {
				"horizontalGradient": {
					"color1":"red",
					"color2":"blue"
				}
			},
			"color2":"0"
		},
		"dup_disk": {
			"color1":"white",
			"size":40,
			"color2":"0"
		}
	}	

Explanations:
- `paste` is a double-filter, hence it takes exactly two images as parameters.
- `dup_disk` calls the same function as `disk` does, but adding `dup_` at the begining prevents the key re-definition.
- Whole images can be passed as color parameters


## Reading the documentation
----------------------------

The documentation file lists all texture and filter functions available in the library.
Each function is displayed by its name, and under it are its available options.

In the following example, the `example` function can be called with both `param1` and `param2`.

> example:
>    - param1
>    - param2

A **texture** function creates an image out of nothing,
A **filter** function transforms an image into another.
A **double-filter** function merges two images into another.

Filter and double-filter functions can be combined infinitely.


## Adding a function to the library
-----------------------------------

If you want to add a new function to the library, write it somewhere in the sources folder.
Then, follow these steps :

1. Export your function at the bottom of the file.

2. If the file is new, edit the Makefile to add it to the compilation list (at the top).

3. If you did the previous step, add a require towards this file in *main_func*.js and add it to the FILTERS/TEXTURES objects

4. Edit the *makedoc.js* file to add a case for your function and specify its parameters.

Your function is now ready to be used with the library.
