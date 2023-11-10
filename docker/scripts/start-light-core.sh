#!/bin/sh

echo "Install dependencies"
# If no dependencies have been update, you can comment this line
# to use up to 30sec in load time
yarn install

# Migrate database if needed (usually required if you run it for the first time)
# sleep 30 # required to wait for the database to start
# yarn run db:migrate

echo "Download artifact and extract it (contains dist folders)"
node ./scripts/preload.js

echo "Unzip dist-artifact-**.zip"
unzip -o dist-artifact-**.zip -q
rm -rf dist-artifact-**.zip

echo "mkdir plugin if does not exist"
mkdir -p /app/apps/core/dist/plugins

echo "start server"
yarn run start --server
