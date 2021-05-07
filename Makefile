DIR = src
PUBLIC_DIR = public

FILTERS_LIST = basic convolution composition color deformation
TEXTURES_LIST = tools_for basic regular_tilings semiregular_tilings polygon_tilings noise
ANIMATIONS_LIST = 

FILTERS = ${foreach filter,${FILTERS_LIST},${DIR}/filters/${filter}_filters.js}
TEXTURES = ${foreach texture,${TEXTURES_LIST},${DIR}/textures/${texture}_textures.js}
ANIMATIONS = ${foreach animation,${ANIMATIONS_LIST},${DIR}/animations/${animation}_animations.js}

all: clean gen

# Generates browser and node files
gen:
	cp ${DIR}/index.html ${PUBLIC_DIR}/
	npx browserify ${DIR}/browser.js ${DIR}/main.js ${FILTERS} ${TEXTURES} ${ANIMATIONS} -o ${PUBLIC_DIR}/browser_main.js
	
	cp ${DIR}/browser.js ${PUBLIC_DIR}/
	cp ${DIR}/main.js ${PUBLIC_DIR}/
	cp ${DIR}/vars.js ${PUBLIC_DIR}/
	cp -r ${DIR}/filters ${PUBLIC_DIR}/
	cp -r ${DIR}/textures ${PUBLIC_DIR}/
	cp -r ${DIR}/animations ${PUBLIC_DIR}/

test:


# Simple rule to test linter errors
lint:
	for obsfile in ${FILTERS} ${TEXTURES} ${ANIMATIONS} ; do \
		npx eslint $$obsfile; \
	done
	npx eslint ${DIR}/vars.js
	npx eslint ${DIR}/main.js
	npx eslint ${DIR}/browser.js

clean:
	#-- Cleaning public repository
	rm -f ${PUBLIC_DIR}/filters/*
	rm -f ${PUBLIC_DIR}/textures/*
	rm -f ${PUBLIC_DIR}/animations/*
	rm -df ${PUBLIC_DIR}/*