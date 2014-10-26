BROWSERIFY = ./node_modules/.bin/browserify
LIBS = $(shell find js/lib -type f -name '*.js')

all:	clean browserify

development:	clean browserify


##
##  BROWSIFY BUILD
##
browserify:
	$(BROWSERIFY) --debug -e src/rancho.js -o dist/rancho.js

##
##  CLEAN
##
clean:
	rm -f dist/*

