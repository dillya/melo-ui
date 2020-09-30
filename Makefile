prefix = /usr/local
protodir = $(prefix)/share/melo/proto
uidir = $(DESTDIR)$(prefix)/share/melo/ui

all: builddir/melo.js builddir/melo.css

.npm:
	npm install protobufjs browserify
	touch $@

builddir:
	mkdir -p builddir

builddir/melo.css: scss/melo.scss | builddir
	sassc $^ $@

builddir/melo_pb.js: $(protodir)/*.proto | .npm builddir
	npx --no-install pbjs -t static-module -w commonjs -o $@ $^

builddir/melo.js: builddir/melo_pb.js
	npx --no-install browserify -r protobufjs -r ./$^:melo -o $@

install: builddir/melo.css builddir/melo.js
	install -d $(uidir)/
	install builddir/melo.css $(uidir)/
	install builddir/melo.js $(uidir)/
	install index.html $(uidir)/
	install -d $(uidir)/img
	install img/* $(uidir)/img/
	install -d $(uidir)/js
	install js/* $(uidir)/js/

dist:
	git archive -o melo-ui.tar --prefix melo-ui-1.0.0/ HEAD
	tar -rf melo-ui.tar --transform 's,^bootstrap,melo-ui-1.0.0/bootstrap,' bootstrap
	gzip -f melo-ui.tar

clean:
	-rm -rf builddir

distclean: clean
	-rm melo-ui.tar.gz

uninstall:
	-rm -rf $(uidir)

.PHONY: all install clean distclean uninstall dist
