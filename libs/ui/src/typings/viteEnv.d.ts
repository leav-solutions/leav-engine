/*
 * Minimal typings for the Vite-injected `import.meta.env` values used in this package
 * (only `DEV`, in _utils/isDevEnv.ts). This replaces the broad `vite/client` types, which were
 * removed from the tsconfigs because their default-export-only `*.module.css` declaration
 * conflicts with the named-import convention (`import {className} from './x.module.css'`).
 */
/* eslint-disable @typescript-eslint/naming-convention -- augmenting TS built-in interfaces, whose names are fixed */
interface ImportMetaEnv {
    readonly DEV: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
