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

export const commonConfig = rootPath => ({
    plugins: [svgr(), react(), jsonHmr(), splitVendorChunkPlugin()],
    resolve: {
        alias: {
            '@leav/ui': path.resolve(__dirname, 'libs/ui/src'),
            components: path.resolve(rootPath, './src/components'),
            context: path.resolve(rootPath, './src/context'),
            hooks: path.resolve(rootPath, './src/hooks'),
            graphQL: path.resolve(rootPath, './src/graphQL'),
            queries: path.resolve(rootPath, './src/queries'),
            assets: path.resolve(rootPath, './src/assets'),
            reduxStore: path.resolve(rootPath, './src/reduxStore'),
            _gqlTypes: path.resolve(rootPath, './src/_gqlTypes'),
            _tests: path.resolve(rootPath, './src/_tests'),
            __mocks__: path.resolve(rootPath, './src/__mocks__'),
            _types: path.resolve(rootPath, './src/_types'),
            constants: path.resolve(rootPath, './src/constants'),
            utils: path.resolve(rootPath, './src/utils'),
            'react-i18next': path.resolve(__dirname, 'node_modules/react-i18next')
        }
    },
    server: {
        port: 3000,
        host: true
    },
    build: {
        minify: 'terser'
    }
});
