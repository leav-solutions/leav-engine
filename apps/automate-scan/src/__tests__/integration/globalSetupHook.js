// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
require('ts-node/register');

const setupModule = require('./globalSetup');

module.exports = async function () {
    await setupModule.setup();

    return null;
};
