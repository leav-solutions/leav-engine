import {registerHooks} from 'node:module';

const isInJavascript = !!__filename.match(/\.js$/);
const coreRootPath = isInJavascript ? __dirname.replace('/src', '/dist') : __dirname;

function resolve(specifier, context, nextResolve) {
    // Custom resolution logic for '@leav/core' imports
    // in plugins tsconfig.json
    // @see ../../../libs/core-publish

    if (specifier.includes('@leav/core/')) {
        const newSpecifier = specifier.replace('@leav/core', coreRootPath);
        return nextResolve(newSpecifier, context);
    }

    // If no customization is needed, defer to the next hook in the chain which would be the
    // Node.js default resolve if this is the last user-specified loader.
    return nextResolve(specifier, context);
}

registerHooks({resolve});
