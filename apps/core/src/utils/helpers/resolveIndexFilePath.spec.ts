import {resolveIndexFilePath} from './resolveIndexFilePath';

describe('resolveIndexFilePath', () => {
    test('Should resolve to index.ts when it exists (dev/tsx run)', async () => {
        const fileExists = vi.fn(async (p: string) => p.endsWith('index.ts'));

        expect(await resolveIndexFilePath('/some/folder', fileExists)).toBe('/some/folder/index.ts');
        expect(fileExists).toHaveBeenCalledWith('/some/folder/index.ts');
    });

    test('Should fall back to index.js when index.ts does not exist (compiled)', async () => {
        const fileExists = vi.fn(async () => false);

        expect(await resolveIndexFilePath('/some/folder', fileExists)).toBe('/some/folder/index.js');
    });
});
