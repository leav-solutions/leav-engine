require('ts-node/register');

const setupModule = require('./globalSetup');

module.exports = async function () {
    await setupModule.setup();

    return null;
};
