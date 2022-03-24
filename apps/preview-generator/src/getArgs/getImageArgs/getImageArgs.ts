// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {join} from 'path';
import {ErrorPreview} from '../../errors/ErrorPreview';
import {Colorspaces} from '../../types/constants';
import {IExec, IVersion} from '../../types/types';
import {handleError} from '../../utils/log';
import {getConfig} from './../../getConfig/getConfig';
import {getSvgCommand} from './../getSvgCommand/getSvgCommand';
import {handleBackground} from './handleBackground/handleBackground';
import {getColorspace} from './helpers/getColorspace';
import {hasClippingPath} from './helpers/hasClippingPath';
import {hasTransparency} from './helpers/hasTransparency';

const _getMainCommand = async (
    ext: string,
    input: string,
    output: string,
    size: number,
    name: string,
    version: IVersion,
    first = false
): Promise<IExec> => {
    if (ext === 'svg') {
        return getSvgCommand(input, output, size);
    }

    const inputFile = `${input}[0]`;
    const command = 'magick';
    const config = await getConfig();

    const inputHasClippingPath = await hasClippingPath(inputFile);

    let profileArgs = [];
    let clippingPathArgs: string[] = [];

    // Hardcoded value in input, to process the image with better quality.
    // User defined density (eg. 72 or 300) is used in output
    const densityArgs = [
        '-density', // use density option
        600 // density value
    ];

    const colorspaceArgs = ['-colorspace', 'srgb'];
    let stripArgs = [];

    if (first) {
        const colorspace = await getColorspace(input);

        if (inputHasClippingPath) {
            const inputHasTransparency = await hasTransparency(inputFile);

            // Select the outside of the clipping path, and apply transparency
            clippingPathArgs = ['+clip-path', '#1', '-alpha', 'transparent', '-evaluate', 'divide', '0'];

            // Select the inside of the clipping path, and set it opaque
            if (!inputHasTransparency) {
                clippingPathArgs = [...clippingPathArgs, '-clip', '-alpha', 'opaque'];
            }
        }

        if (colorspace === Colorspaces.CMYK) {
            profileArgs = [
                ...profileArgs,
                '-profile', // use profile option
                join(config.ICCPath, 'eciCMYK_v2.icc') // profile value
            ];
        }

        profileArgs = [
            ...profileArgs,
            '-profile', // use profile option
            join(config.ICCPath, 'eciRGB_v2.icc') // profile value
        ];

        stripArgs = ['-strip'];
    }

    const densityOutArgs = [
        '-density', // use density option
        version.density ? version.density.toString() : '72' // density value
    ];

    const resizeArgs: string[] = [
        '-geometry', // use resize option
        `${size}x${size}>` // resize value
    ];

    const args: string[] = [
        ...densityArgs,
        inputFile,
        ...profileArgs,
        ...colorspaceArgs,
        ...clippingPathArgs,
        ...resizeArgs,
        ...densityOutArgs,
        ...stripArgs,
        `png:${output}` // output path
    ];

    return {command, args};
};

export const getImageArgs = async (
    ext: string,
    input: string,
    output: string,
    size: number,
    name: string,
    version: IVersion,
    first = false
): Promise<IExec[]> => {
    try {
        const mainCommand = await _getMainCommand(ext, input, output, size, name, version, first);

        let backgroundCommand: IExec = null;
        if (first && version.background !== false) {
            backgroundCommand = handleBackground(version.background, output);
        }

        return [mainCommand, backgroundCommand];
    } catch (err) {
        const errorId = handleError(err);

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
};
