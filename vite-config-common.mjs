import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
import fs from 'fs';

const jsonHmr = () => ({
    name: 'json-hmr',
    enforce: 'post',
    handleHotUpdate({file, server}) {
        if (file.endsWith('.json')) {
            // eslint-disable-next-line no-console
            console.debug(`[vite] JSON hmr update ${file}`);

            server.ws.send({
                type: 'full-reload',
                path: '*',
            });
        }
    },
});

export const devIndexHtmlReplaceVarsPlugin = () => {
    let appName = '';
    return {
        name: 'dev-index-html-replace-vars',
        enforce: 'pre',
        apply: 'serve', // uniquement en dev
        configResolved(config) {
            // Récupère le nom du dossier racine du projet
            appName = path.basename(config.root);
        },
        transformIndexHtml(html) {
            return html
                .replace(/{{APPLICATION_BASE_URL}}/g, process.env.APPLICATION_BASE_URL || `/app/${appName}`)
                .replace(/{{GLOBAL_BASE_URL}}/g, process.env.GLOBAL_BASE_URL || '')
                .replace(/{{BUGSNAG_API_KEY}}/g, process.env.BUGSNAG_API_KEY || '')
                .replace(/{{BUGSNAG_APP_VERSION}}/g, process.env.BUGSNAG_APP_VERSION || '')
                .replace(/{{BUGSNAG_RELEASE_STAGE}}/g, process.env.BUGSNAG_RELEASE_STAGE || '')
                .replace(/{{MATOMO_URL}}/g, process.env.MATOMO_URL || '')
                .replace(/{{MATOMO_SITE_ID}}/g, process.env.MATOMO_SITE_ID || '');
        },
    };
};

// Le polling est nécessaire quand les événements inotify (Linux) ne se propagent pas depuis le système hôte.
// Cas concernés :
//   - Windows/WSL : le filesystem virtuel entre Windows et la couche Linux ne remonte pas les événements.
//   - Rancher Desktop (macOS) : selon la version et la config VirtioFS, les événements peuvent ne pas remonter
//     dans la VM Linux, contrairement à Docker Desktop qui gère cela nativement depuis la v4.6 (VirtioFS par défaut).
// Forcer le polling via VITE_USE_POLLING=true dans docker-compose.override.yml si nécessaire.
const shouldUsePolling = () => {
    if (process.env.VITE_USE_POLLING === 'true') {
        return true;
    }
    try {
        const osrelease = fs.readFileSync('/proc/sys/kernel/osrelease', 'utf8').toLowerCase();
        return osrelease.includes('microsoft');
    } catch {
        return false;
    }
};

export const commonConfig = rootPath => ({
    root: '.',
    plugins: [svgr(), react(), jsonHmr(), devIndexHtmlReplaceVarsPlugin()],
    resolve: {
        alias: [
            {find: '@leav/utils', replacement: path.resolve(import.meta.dirname, 'libs/utils/src')},
            {find: '@leav/ui', replacement: path.resolve(import.meta.dirname, 'libs/ui/src')},
            {find: 'react-i18next', replacement: path.resolve(import.meta.dirname, 'node_modules/react-i18next')},
            {
                find: /_ui\/(.*)/,
                replacement: path.resolve(import.meta.dirname, 'libs/ui/src/$1'),
            },
        ],
    },
    server: {
        port: 3000,
        host: true,
        allowedHosts: 'all',
        watch: shouldUsePolling()
            ? {
                  usePolling: true,
                  interval: 100,
              }
            : undefined,
    },
});
