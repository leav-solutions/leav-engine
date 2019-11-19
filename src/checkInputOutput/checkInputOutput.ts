import {IResponse} from './../types';
import * as path from 'path';
import {ISize} from '../types';
import * as extensionsList from '../extensionsList.json';
import {execVideo} from '../execVideo/execVideo';
import {checkTypeImage} from './checkTypeImage';

export const checkInputOutput = (input: string, output: string, size: ISize): IResponse => {
    const extInput = path
        .extname(input)
        .toLowerCase()
        .replace('.', '');

    const extOutput = path
        .extname(output)
        .toLowerCase()
        .replace('.', '');

    if (extOutput !== 'png') {
        return {
            error_code: 4,
            error: 'file output must be a png',
            output: null
        };
    }

    let fileType = 'other';

    root: for (const index in extensionsList) {
        if ('extensions' in extensionsList[index]) {
            for (const indexExt in extensionsList[index].extensions) {
                if (extensionsList[index].extensions[indexExt] === extInput) {
                    const type = index.split('/')[0];
                    if (type === 'image') {
                        fileType = 'image';
                    } else if (type === 'video') {
                        fileType = 'video';
                    }
                    break root;
                }
            }
        }
    }

    if (extInput === 'pdf') {
        fileType = 'image';
    }

    if (fileType === 'video') {
        return execVideo(input, output, size);
    }

    if (fileType === 'image') {
        return checkTypeImage(input, output, size, extInput);
    }

    return {
        error_code: 5,
        error: 'file type unknow',
        output: null
    };
};
