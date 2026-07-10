import path from 'path';
import loadMigrationFile from './loadMigrationFile';

const fixturesFolder = path.resolve(__dirname, '../../../__tests__/fixtures/loadMigrationFile');

describe('loadMigrationFile', () => {
    test('Should resolve a migration directory to its index.ts when present (dev/tsx run)', async () => {
        const result = await loadMigrationFile(`${fixturesFolder}/dirWithIndexTs`);

        expect(typeof result.default).toBe('function');

        const migration = await result.default();
        expect(await migration.run()).toBe('migrated-via-ts-dir');
    });

    test('Should resolve a migration directory to its index.js and unwrap a re-exported default', async () => {
        const result = await loadMigrationFile(`${fixturesFolder}/dirWithIndexJs`);

        expect(typeof result.default).toBe('function');
        expect(result.default.__esModule).toBeUndefined();

        const migration = await result.default();
        expect(await migration.run()).toBe('migrated-via-js-dir');
    });

    test('Should import a plain migration file path unchanged when it is not a directory', async () => {
        const result = await loadMigrationFile(`${fixturesFolder}/plainFile.ts`);

        expect(typeof result.default).toBe('function');

        const migration = await result.default();
        expect(await migration.run()).toBe('migrated-via-ts-file');
    });

    test('Should unwrap a re-exported default on a plain compiled migration file too', async () => {
        const result = await loadMigrationFile(`${fixturesFolder}/plainFileCompiled.js`);

        expect(typeof result.default).toBe('function');
        expect(result.default.__esModule).toBeUndefined();

        const migration = await result.default();
        expect(await migration.run()).toBe('migrated-via-js-file');
    });
});
