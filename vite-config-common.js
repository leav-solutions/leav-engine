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

const isWindowsWsl = () => {
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
            {find: '@leav/utils', replacement: path.resolve(__dirname, 'libs/utils/src')},
            {find: '@leav/ui', replacement: path.resolve(__dirname, 'libs/ui/src')},
            {find: 'react-i18next', replacement: path.resolve(__dirname, 'node_modules/react-i18next')},
            {
                find: /_ui\/(.*)/,
                replacement: path.resolve(__dirname, 'libs/ui/src/$1'),
            },
        ],
    },
    server: {
        port: 3000,
        host: true,
        watch: isWindowsWsl()
            ? {
                  usePolling: true,
                  interval: 100,
              }
            : undefined,
    },
});
