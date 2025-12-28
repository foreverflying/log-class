#!/bin/sh

set -ex

uglify() {
    for arg in "$@"; do
        npx terser ./min/out/$arg --compress --mangle --output ./lib/$arg
    done
}

copy_declaration() {
    for arg in "$@"; do
        cp ./min/out/$arg ./lib
    done
}

npx minify-ts -o ./src ./min/src logClass.ts
cp tsconfig.json ./min
mkdir -p lib

npx tsc -p ./min --module es2020 --moduleResolution node
mv ./min/out/logClass.js ./min/out/logClass.mjs
npx tsc -p ./min
copy_declaration logClass.d.ts
uglify logClass.js logClass.mjs
