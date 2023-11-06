#bin/sh

echo "Install dependencies"
yarn install

echo "Download artifact and extract it (contains dist folders)"
node ./scripts/preload.js

echo "Unzip dist-artifact-**.zip"
unzip -o dist-artifact-**.zip -q
rm -rf dist-artifact-**.zip

echo "mkdir plugin if does not exist"
mkdir -p /app/apps/core/dist/plugins

echo "start server"
yarn run start --server
