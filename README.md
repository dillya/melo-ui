# Melo UI: User-Interface for Melo

## Overview

This user interface is a web based interface using HTML5, CSS and javascript to
makes it cross-platform.

On CSS side, the **Bootstrap v4** framework is used as foundation since it
provides all necessary components and utilities to make a responsive user
interface easily, and a large community is behind. For Melo UI, we use the SCSS
version of **Bootstrap** in order to embed only useful components and to use the
mixins for Melo SCSS modules.

On javascript side, the Node.js **protobufjs** module is used to encode / decode
the protobuf messages from Melo (benchmarking of this module shows better
performances than the official Google's javascript protobuf plugin). To make it
working in web browser, the Node.js **browserify** module is used.

## Environment

### Style sheet

The style sheet is generated with **sass**, the CSS extension language. Multiple
compilers are available and for Melo UI, we use the C/C++ version which is
available on Debian / Ubuntu as **sassc**. It can be installed with:

```sh
sudo apt install sassc
```

To simplify development and integration, the Melo UI style sheet is based on the
Bootstrap v4.4.1 framework. To compile the final CSS, the bootstrap SCSS files
are needed. To retrieve them, you need to initialize and update the git
submodule with the following command:

```sh
git submodule init
git submodule update
```

### Javascript

To compile and bundle all protobuf javascript code, **Node.js** and **npm** must
be present on your system.

On Debian / Ubuntu distribution, you can install them with:
```sh
sudo apt install npm
```

Then, the **protobufjs** and **browserify** module should be installed with the
following command:

```sh
npm install protobufjs@6.11.3 browserify
```

## Build

To generate all CSS and Javascript files, the script **build.sh** can be called:
it will do all stuff automatically for you (on condition that environment has
been set up correctly, see section above for more details).

```sh
./build.sh
```

## License

No license yet.

