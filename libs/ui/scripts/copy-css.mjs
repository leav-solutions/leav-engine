/*
 * After `tsc` compiles src -> dist, the `.module.css` files are NOT emitted by the TypeScript
 * compiler. The published package (consumed by AMP / xStream from `dist`) therefore needs them
 * copied next to the compiled JS, so each consumer's bundler can resolve
 * `import {...} from './x.module.css'`. Locally, app-studio bundles libs/ui/src directly via the
 * Vite `_ui` / `@leav/ui` alias and does not rely on this copy.
 */
import {copyFileSync, mkdirSync, readdirSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';

const SOURCE_DIR = 'src';
const DIST_DIR = 'dist';
const CSS_MODULE_SUFFIX = '.module.css';

const copyCssModules = directory => {
    for (const entry of readdirSync(directory, {withFileTypes: true})) {
        const entryPath = join(directory, entry.name);
        if (entry.isDirectory()) {
            copyCssModules(entryPath);
        } else if (entry.name.endsWith(CSS_MODULE_SUFFIX)) {
            const destination = join(DIST_DIR, relative(SOURCE_DIR, entryPath));
            mkdirSync(dirname(destination), {recursive: true});
            copyFileSync(entryPath, destination);
        }
    }
};

copyCssModules(SOURCE_DIR);
