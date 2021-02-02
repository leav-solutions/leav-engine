// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable @typescript-eslint/no-var-requires */
const appRoot = require('app-root-path');
const fs = require('fs');
const path = require('path');

module.exports = async function () {
    // Remove fake plugin
    const pluginsFolder = path.resolve(appRoot + '/apps/core/src/plugins/');
    const fakePluginDest = `${pluginsFolder}/fakeplugin`;

    fs.unlinkSync(fakePluginDest);
};
