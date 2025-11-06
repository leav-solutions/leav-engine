// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import {XMLParser} from 'fast-xml-parser';

const COMMAND = 'inkscape';
const DEFAULT_SIZE_ARG = '-h';

const _getSvgDimensions = async (svgPath: string): Promise<{width: number | null; height: number | null}> => {
    const svgContent = await fs.promises.readFile(svgPath, 'utf-8');
    const parser = new XMLParser({ignoreAttributes: false, attributeNamePrefix: ''});
    const parsed = parser.parse(svgContent);
    const svgAttrs = parsed.svg;
    let width = svgAttrs.width ? parseFloat(svgAttrs.width) : null;
    let height = svgAttrs.height ? parseFloat(svgAttrs.height) : null;

    // if width/height are not defined, we try to extract them from viewBox
    if ((!width || !height) && svgAttrs.viewBox) {
        const [, , w, h] = svgAttrs.viewBox.split(/\s+/).map(Number);
        width = width || w || null;
        height = height || h || null;
    }

    return {width, height};
};

export const getSvgCommand = async (input: string, output: string, size: number) => {
    const {width, height} = await _getSvgDimensions(input);

    const sizeArg = !width || !height ? DEFAULT_SIZE_ARG : width / height > 1 ? '-w' : '-h';
    const args = ['-o', output, sizeArg, size.toString(), input];

    return {
        command: COMMAND,
        args,
    };
};
