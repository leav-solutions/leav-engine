import react from '@vitejs/plugin-react';
import path from 'path';
import {splitVendorChunkPlugin} from 'vite';
import svgr from 'vite-plugin-svgr';

export const jsonHmr = () => {
    return {
        name: 'json-hmr',
        enforce: 'post',
        handleHotUpdate({file, server}) {
            if (file.endsWith('.json')) {
                console.debug(`[vite] JSON hmr update ${file}`);

                server.ws.send({
                    type: 'full-reload',
                    path: '*'
                });
            }
        }
    };
};

export const commonConfig = rootPath => {
    console.log('rootPath', rootPath);
    return {
        root: '.',
        plugins: [svgr(), react(), jsonHmr(), splitVendorChunkPlugin()],
        resolve: {
            alias: [
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
                    replacement: path.resolve(__dirname, 'libs/ui/src/$1')
                }
            ]
        },
        server: {
            port: 3000,
            host: true
        }
    };
};
