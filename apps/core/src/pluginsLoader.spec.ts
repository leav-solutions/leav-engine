import path from 'path';
import {existsSync} from 'fs';
import {asValue, createContainer, InjectionMode} from 'awilix';
import {type IUtils} from './utils/utils';
import {initPlugins} from './pluginsLoader';

vi.mock('./config', () => ({
    getConfig: vi.fn().mockResolvedValue({}),
}));

const fixturesFolder = './src/__tests__/fixtures/pluginsLoaderPlugin';

const makeContainer = (registerPlugin = vi.fn()) => {
    const container = createContainer({injectionMode: InjectionMode.PROXY});

    const utils: Mockify<IUtils> = {
        fileExists: vi.fn(async (p: string) => existsSync(p)),
    };

    container.register('core.app.core.plugins', asValue({registerPlugin}));
    container.register('core.utils', asValue(utils));
    container.register('config', asValue({plugins: {}}));

    return container;
};

describe('pluginsLoader', () => {
    describe('initPlugins', () => {
        test('Should resolve a plugin folder containing only index.ts (dev/tsx run) and call its default export', async () => {
            const registerPlugin = vi.fn();
            const container = makeContainer(registerPlugin);

            await initPlugins([`${fixturesFolder}/tsPlugin`], container);

            expect(registerPlugin).toHaveBeenCalledWith(
                expect.stringContaining('tsPlugin'),
                expect.objectContaining({name: 'ts-plugin'}),
            );
        });

        test('Should unwrap a tsc-compiled CJS default export and call the real plugin factory', async () => {
            const container = makeContainer();

            await initPlugins([`${fixturesFolder}/compiledPlugin`], container);

            const compiledModule = await import(
                path.resolve(__dirname, `../${fixturesFolder}/compiledPlugin/index.js`)
            );
            expect(compiledModule.wasInitCalled()).toBe(true);
        });

        test('Should not attempt to call init when a plugin module has no real default export', async () => {
            const registerPlugin = vi.fn();
            const container = makeContainer(registerPlugin);

            await expect(initPlugins([`${fixturesFolder}/namedOnlyPlugin`], container)).resolves.not.toThrow();

            expect(registerPlugin).toHaveBeenCalledWith(
                expect.stringContaining('namedOnlyPlugin'),
                expect.objectContaining({name: 'named-only-plugin'}),
            );
        });

        test('Should read package.json infos via plain file read (name/description/version/author)', async () => {
            const registerPlugin = vi.fn();
            const container = makeContainer(registerPlugin);

            await initPlugins([`${fixturesFolder}/tsPlugin`], container);

            expect(registerPlugin).toHaveBeenCalledWith(expect.any(String), {
                name: 'ts-plugin',
                description: 'TS plugin fixture',
                version: '1.0.0',
                author: 'test',
            });
        });
    });
});
