import {isTscCjsDoubleWrap} from '../../../utils/helpers/isTscCjsDoubleWrap';
import {resolveDynamicImportPath} from '../../../utils/helpers/resolveDynamicImportPath';

export default async (filepath: string): Promise<any> => {
    const resolvedPath = await resolveDynamicImportPath(filepath);
    const importedFile = await import(resolvedPath);

    if (isTscCjsDoubleWrap(importedFile.default)) {
        return importedFile.default;
    }

    return importedFile;
};
