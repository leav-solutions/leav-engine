import {stat} from 'fs/promises';
import {resolveIndexFilePath} from './resolveIndexFilePath';

const fileExists = async (path: string): Promise<boolean> => (await stat(path).catch(() => null)) !== null;

/**
 * Resolve `filepath` for use with a dynamic import(): if it's a directory, resolve it to its
 * index.ts/index.js as `resolveIndexFilePath` does; otherwise return it unchanged.
 */
export const resolveDynamicImportPath = async (filepath: string): Promise<string> => {
    const stats = await stat(filepath).catch(() => null);

    return stats?.isDirectory() ? resolveIndexFilePath(filepath, fileExists) : filepath;
};
