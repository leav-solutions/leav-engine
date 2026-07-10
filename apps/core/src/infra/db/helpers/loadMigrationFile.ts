import {stat} from 'fs/promises';
import {isTscCjsDoubleWrap} from '../../../utils/helpers/isTscCjsDoubleWrap';

export default async (filepath: string): Promise<any> => {
    // Unlike require(), Node's native import() doesn't resolve a directory to its index file,
    // and always needs an explicit extension - resolve to whichever exists (.ts in dev via tsx,
    // .js once compiled).
    let resolvedPath = filepath;
    const stats = await stat(filepath).catch(() => null);
    if (stats?.isDirectory()) {
        const indexTsStats = await stat(`${filepath}/index.ts`).catch(() => null);
        resolvedPath = indexTsStats ? `${filepath}/index.ts` : `${filepath}/index.js`;
    }
    const importedFile = await import(resolvedPath);

    if (isTscCjsDoubleWrap(importedFile.default)) {
        return importedFile.default;
    }

    return importedFile;
};
