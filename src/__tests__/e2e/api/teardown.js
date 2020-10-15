/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
const fs = require('fs');
const path = require('path');

module.exports = async function() {
    // Remove fake plugin
    const pluginsFolder = path.resolve(appRoot + '/src/plugins/');
    const fakePluginDest = `${pluginsFolder}/fakeplugin`;

    fs.unlinkSync(fakePluginDest);
};
