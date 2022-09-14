// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Remove a double semicolon in the Semantic UI CSS which makes build in webpack 5 fail
// Unfortunately, as Semantic UI is not maintained anymore, we have to fix it manually.
// This script should become unnecessary when the next version of Fomantic UI is released.
const fs = require('fs');
const path = require('path');

const _fixDoubleSemicolons = () => {
    const filesToCheck = [
        '../../../node_modules/fomantic-ui-less/themes/default/elements/step.overrides',
        '../node_modules/fomantic-ui-less/themes/default/elements/step.overrides'
    ];

    console.info('Fixing double semicolons in Semantic UI CSS files...');

    filesToCheck.forEach(file => {
        const filePath = path.resolve(__dirname, file);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(/;;/g, ';');
            fs.writeFileSync(filePath, content, 'utf8');

            console.info('Fixed Semantic CSS in ' + filePath);
        }
    });
};

_fixDoubleSemicolons();
