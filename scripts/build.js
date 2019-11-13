#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path');
const {execSync} = require('child_process');
const glob = require('glob');

const buildFolder = path.resolve(appRoot + '/build');
const pluginsFolder = path.resolve(appRoot + '/src/plugins');

// Empty build folder
if (fs.existsSync(buildFolder)) {
    fs.rmdirSync(buildFolder, {recursive: true});
}

// Run transpilation
try {
    execSync('tsc').toString();
} catch (e) {
    console.error(e.stderr.toString(), e.stdout.toString());
    process.exit(1);
}

// Copy plugins package.json files to build folder
const pkgFiles = glob.sync('*/package.json', {cwd: pluginsFolder});
for (const pkgFile of pkgFiles) {
    fs.copyFileSync(pluginsFolder + '/' + pkgFile, buildFolder + '/plugins/' + pkgFile);
}
