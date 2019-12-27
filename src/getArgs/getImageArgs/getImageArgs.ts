import {execFile} from 'child_process';
import {getConfig} from './../../getConfig/getConfig';
import {getPsdArgs} from './getPsdArgs/getPsdArgs';
import {getJpgArgs} from './getJpgArgs/getJpgArgs';
import {handleBackground} from './handleBackground/handleBackground';
import {IExec, IArgs, IVersion} from './../../types';
import {join} from 'path';

export const getImageArgs = async (
    ext: string,
    input: string,
    output: string,
    size: number,
    version: IVersion,
    first = false,
): Promise<IExec[]> => {
    const command = 'convert';

    const args = [
        input, // input path
        '-resize', // use resize option
        `${size}x${size}>`, // resize value
        '-density', // use density option
        version.density ? version.density.toString() : '200', // density value
        `png:${output}`, // output path
    ];

    if (first) {
        // not neccessary for imagemagick >=7
        const [errorIdentify, colorspace] = await new Promise(r =>
            execFile('identify', ['-format', '%r', input], {}, (error, response) => r([error, response])),
        );

        if (errorIdentify) {
            throw {
                error: 14,
                params: {
                    background: version.background,
                    density: version.density,
                    size,
                    output,
                },
            };
        }

        if (colorspace.indexOf('CYMK') > -1) {
            const config = getConfig();
            const profileArgs = [
                '-profile', // use profile option
                join(config.ICCPath, 'EuroscaleCoated.icc'), // profile value
                '-profile', // use profile option
                join(config.ICCPath, 'srgb.icm'), // profile value
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
            args.splice(0, 1, `${input}[0]`); // take only the first page of the pdf
            break;
    }

    let backgroundsArgs: IExec = null;
    if (first) {
        backgroundsArgs = handleBackground(args, version.background, output);
    }

    return [
        {
            command,
            args,
        },
        backgroundsArgs,
    ];
};

const _addTypeArgs = async (getTypeArgs: (input: string) => Promise<IArgs>, args: string[], input: string) => {
    const {before: beforeArgs, after: afterArgs}: IArgs = await getTypeArgs(input);
    args.splice(1, 0, ...beforeArgs);
    args.splice(-1, 0, ...afterArgs);
};
