import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';

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

export const commonConfig = rootPath => ({
    root: '.',
    plugins: [svgr(), react(), jsonHmr(), devIndexHtmlReplaceVarsPlugin()],
    resolve: {
        alias: [
            {find: '@leav/utils', replacement: path.resolve(__dirname, 'libs/utils/src')},
            {find: '@leav/ui', replacement: path.resolve(__dirname, 'libs/ui/src')},
            {find: 'components', replacement: path.resolve(rootPath, './src/components')},
            {find: 'context', replacement: path.resolve(rootPath, './src/context')},
            {find: 'hooks', replacement: path.resolve(rootPath, './src/hooks')},
            {find: 'graphQL', replacement: path.resolve(rootPath, './src/graphQL')},
            {find: 'queries', replacement: path.resolve(rootPath, './src/queries')},
            {find: 'assets', replacement: path.resolve(rootPath, './src/assets')},
            {find: 'reduxStore', replacement: path.resolve(rootPath, './src/reduxStore')},
            {find: '_gqlTypes', replacement: path.resolve(rootPath, './src/_gqlTypes')},
            {find: '_tests', replacement: path.resolve(rootPath, './src/_tests')},
            {find: '__mocks__', replacement: path.resolve(rootPath, './src/__mocks__')},
            {find: '_types', replacement: path.resolve(rootPath, './src/_types')},
            {find: 'constants', replacement: path.resolve(rootPath, './src/constants')},
            {find: 'utils', replacement: path.resolve(rootPath, './src/utils')},
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
    },
});
