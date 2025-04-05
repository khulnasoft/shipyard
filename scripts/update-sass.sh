#!/bin/bash

# Check if sass is installed
if ! command -v sass &> /dev/null; then
    echo "sass is not installed. Please install it using: npm install -g sass"
    exit 1
fi

# Default source and destination directories
SASS_DIR="./src/styles"
CSS_DIR="./public/css"

# Create directories if they don't exist
mkdir -p "$SASS_DIR"
mkdir -p "$CSS_DIR"

# Create a symlink for @ to point to src directory if it doesn't exist
if [ ! -L "./src/@" ]; then
    cd ./src && ln -s . @ && cd ..
fi

echo "Starting SASS watch process..."
echo "Watching $SASS_DIR for changes..."
echo "Compiled CSS will be output to $CSS_DIR"

# Watch for changes and compile with load paths set correctly
sass --watch "$SASS_DIR:$CSS_DIR" --style compressed --load-path=src
