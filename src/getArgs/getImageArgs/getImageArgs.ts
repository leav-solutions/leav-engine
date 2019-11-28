import {getPsdArgs} from './getPsdArgs/getPsdArgs';
import {getJpgArgs} from './getJpgArgs/getJpgArgs';
import {IExec, IArgs} from './../../types';
import {join} from 'path';

export const getImageArgs = (ext: string, input: string, output: string, size: number, useProfile = false): IExec => {
    // const config = getConfig();
    const config = {ICCPath: '/app/profile'}; // temp

    const command = 'convert';
    const args = [
        input, // input path
        '-resize', // use resize option
        `${size}x${size}>`, // resize value
        '-density', // use density option
        '200', // density value
        `png:${output}`, // output path
    ];

    if (useProfile) {
        const profileArgs = [
            '-profile', // use profile option
            join(config.ICCPath, 'EuroscaleCoated.icc'), // profile value
            '-profile', // use profile option
            join(config.ICCPath, 'srgb.icm'), // profile value
        ];

        args.splice(-1, 0, ...profileArgs);
    }

    switch (ext) {
        case 'psd':
            addTypeArgs(getPsdArgs, args, input);
            break;
        case 'jpg':
        case 'jpeg':
            addTypeArgs(getJpgArgs, args, input);
            break;
    }

    return {
        command,
        args,
    };
};

const addTypeArgs = (getTypeArgs: (input: string) => IArgs, args: string[], input: string) => {
    const {before: beforeArgs, after: afterArgs}: IArgs = getTypeArgs(input);
    args.splice(1, 0, ...beforeArgs);
    args.splice(-1, 0, ...afterArgs);
};
