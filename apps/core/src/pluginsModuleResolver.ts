// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {registerHooks} from 'node:module';

const isInJavascript = !!__filename.match(/\.js$/);
const coreRootPath = isInJavascript ? __dirname.replace('/src', '/dist') : __dirname;

function resolve(specifier, context, nextResolve) {
    // Custom resolution logic for '@leav/core' imports
    // in plugins tsconfig.json
    // "paths": {
    //     "@leav/core/*": ["../../node_modules/@aristid/leav-types/apps/core/src/*"],
    //     "@leav/utils": ["../../node_modules/@aristid/leav-types/libs/utils/src/index"],
    //     "@leav/logger": ["../../node_modules/@aristid/leav-types/libs/logger/src/index"]
    //     ...and other paths if needed
    // },

    if (specifier.includes('@leav/core/')) {
        const newSpecifier = specifier.replace('@leav/core', coreRootPath);
        return nextResolve(newSpecifier, context);
    }

    // If no customization is needed, defer to the next hook in the chain which would be the
    // Node.js default resolve if this is the last user-specified loader.
    return nextResolve(specifier, context);
}

registerHooks({resolve});
