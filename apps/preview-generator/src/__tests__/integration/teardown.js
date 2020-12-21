const fs = require('fs');
const path = require('path');
const config = require('../../../config/config_spec.json');

module.exports = async function() {
    // try {
    //     const files = fs.readdirSync(path.join(config.rootPath, '/src/files/test/preview'));
    //     for (const file of files) {
    //         fs.unlink()
    //     }
    // } catch (e) {
    //     console.error(e);
    // }

    process.exit(0);

    return null;
};
