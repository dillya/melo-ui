# Melo UI: User-Interface for Melo

## Overview

This user interface is a web based interface using HTML5, CSS and javascript to
makes it cross-platform.

On CSS side, the **Bootstrap v4** framework is used as foundation since it
provides all necessary components and utilities to make a responsive user
interface easily, and a large community is behind. For Melo UI, we use the SCSS
version of **Bootstrap** in order to embed only useful components and to use the
mixins for Melo SCSS modules.

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

## Build

To generate all CSS and Javascript files, the script **build.sh** can be called:
it will do all stuff automatically for you (on condition that environment has
been set up correctly, see section above for more details).

```sh
./build.sh
```

## License

No license yet.

