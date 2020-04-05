#!/bin/bash

BUILD_DIR=builddir
PROTO_DIR=../melo/proto

# Print command status
function print_status() {
  if [ $1 -ne 0 ]; then
    echo -e " -> \e[31mFAILED\e[0m"
    exit $1
  else
    echo -e " -> \e[32mDONE\e[0m"
  fi
}

# Check programs
if ! command -v npx >/dev/null; then
  echo "The program npx is not installed, please read Environment section of the"
  echo "README.md to install all dependencies."
  exit 1
fi

# Create build directory
if [ ! -d $BUILD_DIR ]; then
  mkdir $BUILD_DIR
fi

#
# Style sheet
#

# Generate style sheet from SCSS (Sass)
echo "[I] Compile CSS"
sassc scss/melo.scss $BUILD_DIR/melo.css
print_status $?

#
# Javascript
#

# Compile protobuf files
echo "[I] Generate protobuf javascript"
npx --no-install pbjs -t static-module -w commonjs -o $BUILD_DIR/melo_pb.js \
  $PROTO_DIR/browser.proto $PROTO_DIR/player.proto $PROTO_DIR/playlist.proto
print_status $?

# Bundle generated protobufjs files
echo "[I] Bundle javascript"
npx --no-install browserify -r protobufjs -r ./$BUILD_DIR/melo_pb.js:melo \
  -o $BUILD_DIR/melo.js
print_status $?

