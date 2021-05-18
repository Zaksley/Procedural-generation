DIR = src
PUBLIC_DIR = public

FILTERS_LIST = basic convolution composition color deformation
TEXTURES_LIST = tools_for basic regular_tilings semiregular_tilings polygon_tilings noise cellular_automata distance signed_distance fractal shape
ANIMATIONS_LIST = 

FILTERS = ${foreach filter,${FILTERS_LIST},${DIR}/filters/${filter}_filters.js}
TEXTURES = ${foreach texture,${TEXTURES_LIST},${DIR}/textures/${texture}_textures.js}
ANIMATIONS = ${foreach animation,${ANIMATIONS_LIST},${DIR}/animations/${animation}_animations.js}

all: clean gen

# Generates browser and node files
gen:
	cp ${DIR}/index.html ${PUBLIC_DIR}/
	npx browserify ${DIR}/browser.js ${DIR}/main_func.js ${FILTERS} ${TEXTURES} ${ANIMATIONS} -o ${PUBLIC_DIR}/browser_main.js

test:
	npx jest --verbose

# Generate documentation
doc:
	node ${DIR}/makedoc.js

# Simple rule to test linter errors
lint:
	for obsfile in ${FILTERS} ${TEXTURES} ${ANIMATIONS} ; do \
		npx eslint $$obsfile; \
	done
	npx eslint ${DIR}/vars.js
	npx eslint ${DIR}/main_func.js
	npx eslint ${DIR}/main.js
	npx eslint ${DIR}/browser.js
	npx eslint ${DIR}/makedoc.js

# Generate a file from example.txt
example:
	node ${DIR}/main.js example.txt example.png
	eog example.png

# Cleaning public repository
clean: 	
	rm -f ${PUBLIC_DIR}/*

