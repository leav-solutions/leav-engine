import path from 'path';
import {resolveDynamicImportPath} from './resolveDynamicImportPath';

const fixturesFolder = path.resolve(__dirname, '../../__tests__/fixtures/loadMigrationFile');

describe('resolveDynamicImportPath', () => {
    test('Should resolve a directory to its index.ts when present (dev/tsx run)', async () => {
        const resolved = await resolveDynamicImportPath(`${fixturesFolder}/dirWithIndexTs`);
        expect(resolved).toBe(`${fixturesFolder}/dirWithIndexTs/index.ts`);
    });

    test('Should resolve a directory to its index.js when there is no index.ts (compiled)', async () => {
        const resolved = await resolveDynamicImportPath(`${fixturesFolder}/dirWithIndexJs`);
        expect(resolved).toBe(`${fixturesFolder}/dirWithIndexJs/index.js`);
    });

    test('Should leave a plain file path unchanged', async () => {
        const resolved = await resolveDynamicImportPath(`${fixturesFolder}/plainFile.ts`);
        expect(resolved).toBe(`${fixturesFolder}/plainFile.ts`);
    });
});
