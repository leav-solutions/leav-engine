import path from 'path';
import {createContainer, InjectionMode} from 'awilix';
import {registerModules} from './depsManager';

// Scoped directly to the fixtures folder rather than going through initDI(), which scans and
// imports every index file under apps/core/src - too heavy/side-effecting for a unit test of the
// CJS-interop unwrap logic, and prone to flakiness when run alongside the rest of the suite.
const fixturesFolder = path.resolve(__dirname, './__tests__/fixtures/depsManagerPlugin');

describe('depsManager', () => {
    describe('registerModules', () => {
        test('Should unwrap a re-exported default export from a compiled CommonJS module', async () => {
            const container = createContainer({injectionMode: InjectionMode.PROXY});
            await registerModules(container, fixturesFolder, '**/index.+(ts|js)');

            const utils = container.cradle.utils;

            expect(typeof utils.fileExists).toBe('function');
            expect(await utils.fileExists()).toBe(true);
        });

        test('Should register named exports under their own key, unaffected by the default-unwrap guard', async () => {
            const container = createContainer({injectionMode: InjectionMode.PROXY});
            await registerModules(container, fixturesFolder, '**/index.+(ts|js)');

            // depsManager registers any function export as an Awilix factory (invoked eagerly via
            // the cradle), so a named export ends up as its return value here, not the function
            // itself - this is the pre-existing DI convention, unrelated to the unwrap guard above.
            expect(container.cradle['utils.namedThing']).toBe('named-value');
            expect(container.cradle['infra.namedOnly']).toBe('infra-value');
        });

        test('Should not register the __esModule/module.exports interop artifacts as their own entries', async () => {
            const container = createContainer({injectionMode: InjectionMode.PROXY});
            await registerModules(container, fixturesFolder, '**/index.+(ts|js)');

            expect('utils.__esModule' in container.registrations).toBe(false);
            expect('utils.module.exports' in container.registrations).toBe(false);
        });
    });
});
