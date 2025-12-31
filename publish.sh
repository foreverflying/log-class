#!/bin/sh

set -ex


rm -rf ./min/* ./lib/*
npx minify-ts -o ./src ./min/src logClass.ts
cp tsconfig.json ./min
npx tsc -p ./min
mv ./min/out/logClass.js ./min/out/logClass.cjs
npx tsc -p ./min --module es2020
mv ./min/out/logClass.js ./min/out/logClass.mjs

mkdir -p lib
npx terser ./min/out/logClass.cjs --compress --mangle --output ./lib/logClass.cjs
npx terser ./min/out/logClass.mjs --compress --mangle --output ./lib/logClass.mjs
mv ./min/out/logClass.d.ts ./lib/logClass.d.ts
