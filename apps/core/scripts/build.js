#!/usr/bin/env node
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path');
const {execSync} = require('child_process');
const glob = require('glob');

const root = path.resolve(__dirname + '/..');
const buildFolder = path.resolve(root + '/dist');
const srcPluginsFolder = path.resolve(root + '/src/plugins');
const buildPluginsFolder = path.resolve(buildFolder + '/plugins');

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

// Create plugins folder if does not exists
if (!fs.existsSync(buildPluginsFolder)) {
    fs.mkdirSync(buildPluginsFolder);
}

// Copy plugins package.json files to build folder
const pkgFiles = glob.sync('*/package.json', {cwd: srcPluginsFolder});
for (const pkgFile of pkgFiles) {
    fs.copyFileSync(srcPluginsFolder + '/' + pkgFile, buildPluginsFolder + '/' + pkgFile);
}
