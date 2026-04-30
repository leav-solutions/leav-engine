#!/usr/bin/env node

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const root = path.resolve(__dirname + '/..');
const buildFolder = path.resolve(root + '/dist');

// Empty build folder
if (fs.existsSync(buildFolder)) {
    fs.rmdirSync(buildFolder, {recursive: true});
}

// Run transpilation
try {
    execSync('tsc -b tsconfig.build.json').toString();
} catch (e) {
    console.error(e.stderr.toString(), e.stdout.toString());
    process.exit(1);
}

// Copy html files to build folder
const htmlFiles = fs.globSync('**/*.html', {
    cwd: root + '/src',
    exclude: fileName => fileName.match(/(node_modules|__tests__)\//),
});
for (const htmlFile of htmlFiles) {
    fs.copyFileSync(root + '/src/' + htmlFile, buildFolder + '/' + htmlFile);
}
