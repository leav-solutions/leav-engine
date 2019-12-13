import {execFileSync} from 'child_process';
import {getConfig} from './../../getConfig/getConfig';
import {getPsdArgs} from './getPsdArgs/getPsdArgs';
import {getJpgArgs} from './getJpgArgs/getJpgArgs';
import {handleBackground} from './handleBackground/handleBackground';
import {IExec, IArgs, IVersion} from './../../types';
import {join} from 'path';

export const getImageArgs = (
    ext: string,
    input: string,
    output: string,
    size: number,
    version: IVersion,
    useProfile = false,
): IExec[] => {
    const command = 'convert';

    const args = [
        input, // input path
        '-resize', // use resize option
        `${size}x${size}>`, // resize value
        '-density', // use density option
        version.density ? version.density.toString() : '200', // density value
        `png:${output}`, // output path
    ];

    if (useProfile) {
        try {
            // not neccessary for imagemagick >=7
            const colorspace = execFileSync('identify', ['-format', '%r', input]);

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
        } catch (e) {
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
    }

    switch (ext) {
        case 'psd':
            addTypeArgs(getPsdArgs, args, input);
            break;
        case 'jpg':
        case 'jpeg':
            addTypeArgs(getJpgArgs, args, input);
            break;
        case 'pdf':
            args.splice(0, 1, `${input}[0]`); // take only the first page of the pdf
            break;
    }

    let backgroundsArgs: IExec = null;
    if (useProfile) {
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

const addTypeArgs = (getTypeArgs: (input: string) => IArgs, args: string[], input: string) => {
    const {before: beforeArgs, after: afterArgs}: IArgs = getTypeArgs(input);
    args.splice(1, 0, ...beforeArgs);
    args.splice(-1, 0, ...afterArgs);
};
