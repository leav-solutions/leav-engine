import {ErrorPreview} from './../../types/ErrorPreview';
import {extname} from 'path';
import * as extensions from './MIMEByExtension.json';

export const getFileType = (file: string): string => {
    const extension = extname(file)
        .toLowerCase()
        .replace('.', '');

    const type = extensions[extension].type;

    if (!type) {
        throw new ErrorPreview({
            error: 301,
            params: null,
        });
    }

    return type;
};
