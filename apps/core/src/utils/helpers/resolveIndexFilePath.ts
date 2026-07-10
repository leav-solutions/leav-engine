/**
 * Unlike require(), Node's native import() doesn't resolve a directory to its index file, and
 * always needs an explicit extension - resolve `folderPath` to its `index.ts` (dev, via tsx) or
 * `index.js` (once compiled), using the given existence check.
 */
export const resolveIndexFilePath = async (
    folderPath: string,
    fileExists: (path: string) => Promise<boolean>,
): Promise<string> => {
    const indexTsPath = `${folderPath}/index.ts`;
    return (await fileExists(indexTsPath)) ? indexTsPath : `${folderPath}/index.js`;
};
