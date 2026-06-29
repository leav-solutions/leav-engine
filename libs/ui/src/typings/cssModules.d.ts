/*
 * CSS Modules are bundled by each consumer: app-studio (and AMP / xStream) resolve
 * `*.module.css` through their Vite + lightningcss pipeline. The module is declared untyped
 * so individual class names can be imported by name — `import {myClass} from './x.module.css'` —
 * per the project convention (named imports, never a default `styles` object).
 */
declare module '*.module.css';
