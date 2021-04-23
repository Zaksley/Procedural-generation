DIR = src
PUBLIC_DIR = public

all: gen

gen:
	cp ${DIR}/index.html ${PUBLIC_DIR}/
	cp ${DIR}/browser.js ${PUBLIC_DIR}/
	cp ${DIR}/main.js ${PUBLIC_DIR}/
	cp ${DIR}/textures.js ${PUBLIC_DIR}/
	cp ${DIR}/filters.js ${PUBLIC_DIR}/
	cp ${DIR}/animations.js ${PUBLIC_DIR}/

test:


clean:
	rm -f ${PUBLIC_DIR}/*