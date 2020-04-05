#!/bin/bash

BUILD_DIR=builddir

# Print command status
function print_status() {
  if [ $1 -ne 0 ]; then
    echo -e " -> \e[31mFAILED\e[0m"
    exit $1
  else
    echo -e " -> \e[32mDONE\e[0m"
  fi
}

# Create build directory
if [ ! -d $BUILD_DIR ]; then
  mkdir $BUILD_DIR
fi

