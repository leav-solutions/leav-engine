#!/bin/bash

yarn install

# Used to be able to exec "git rev-parse HEAD" in preload.js
git config --system --add safe.directory /app

echo "Download artifact and extract it (contains dist folders)"
node ./scripts/preload.js

echo "Unzip dist-artifact-**.zip"
unzip -o dist-artifact-**.zip -q
rm -rf dist-artifact-**.zip

echo "mkdir plugin if does not exist"
mkdir -p /app/apps/core/dist/plugins

echo "start server"
yarn run start --server
