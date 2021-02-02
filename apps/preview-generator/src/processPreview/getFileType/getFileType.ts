// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
