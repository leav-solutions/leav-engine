import {ErrorPreview} from './../../types/ErrorPreview';
import {extname} from 'path';
import * as extensions from './MIMEByExtension.json';

export const getFileType = (file: string): string => {
    const extension = extname(file).toLowerCase().replace('.', '');

    if (!extensions[extension]) {
        throw new ErrorPreview({
            error: 301,
            params: null
        });
    }

    const type = extensions[extension].type;

    return type;
};
