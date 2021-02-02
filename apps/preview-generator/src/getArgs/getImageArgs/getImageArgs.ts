// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import {join} from 'path';
import {IArgs, IExec, IVersion} from '../../types/types';
import {getConfig} from './../../getConfig/getConfig';
import {ErrorPreview} from './../../types/ErrorPreview';
import {handleError} from './../../utils/log';
import {getSvgCommand} from './../getSvgCommand/getSvgCommand';
import {getJpgArgs} from './getJpgArgs/getJpgArgs';
import {getPsdArgs} from './getPsdArgs/getPsdArgs';
import {handleBackground} from './handleBackground/handleBackground';

export const getImageArgs = async (
    ext: string,
    input: string,
    output: string,
    size: number,
    name: string,
    version: IVersion,
    first = false
): Promise<IExec[]> => {
    let command = 'convert';

    let args = [
        '-density', // use density option
        version.density ? version.density.toString() : '200', // density value
        input, // input path
        '-resize', // use resize option
        `${size}x${size}>`, // resize value
        `png:${output}` // output path
    ];

    if (first) {
        const [errorIdentify, colorspace] = await new Promise(r =>
            execFile('identify', ['-format', '%r', input], {}, (error, response) => r([error, response]))
        );

        if (errorIdentify) {
            const errorId = handleError(errorIdentify);

            throw new ErrorPreview({
                error: 504,
                params: {
                    background: version.background,
                    density: version.density,
                    size,
                    output,
                    name,
                    errorId
                }
            });
        }

        if (colorspace.indexOf('CMYK') > -1) {
            const config = await getConfig();
            const profileArgs = [
                '-profile', // use profile option
                join(config.ICCPath, 'EuroscaleCoated.icc'), // profile value
                '-profile', // use profile option
                join(config.ICCPath, 'srgb.icm') // profile value
            ];

            args.splice(-1, 0, ...profileArgs);
        }
    }

    switch (ext) {
        case 'psd':
            await _addTypeArgs(getPsdArgs, args, input);
            break;
        case 'jpg':
        case 'jpeg':
            await _addTypeArgs(getJpgArgs, args, input);
            break;
        case 'pdf':
            args.splice(2, 1, `${input}[0]`); // replace the input, take only the first page of the pdf
            break;
        case 'svg':
            // svg don't work with imageMagick
            const res = getSvgCommand(input, output, size);
            command = res.command;
            args = res.args;
            break;
        case 'eps':
            // remove existing profile after input given
            args.splice(
                2,
                0,
                '+profile', // remove profile
                '*' // remove all profile
            );
            break;
        case 'tif':
        case 'tiff':
            args.splice(0, 0, '-flatten');
            break;
    }

    let backgroundsArgs: IExec = null;
    if (first) {
        backgroundsArgs = handleBackground(args, version.background, output);
    }

    return [
        {
            command,
            args
        },
        backgroundsArgs
    ];
};

const _addTypeArgs = async (getTypeArgs: (input: string) => Promise<IArgs>, args: string[], input: string) => {
    const {before: beforeArgs, after: afterArgs}: IArgs = await getTypeArgs(input);
    args.splice(2, 0, ...beforeArgs);
    args.splice(-1, 0, ...afterArgs);
};
