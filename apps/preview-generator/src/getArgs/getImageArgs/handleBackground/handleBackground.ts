// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IExec} from '../../../types/types';

export const handleBackground = (background: boolean | string, output: string): IExec => {
    if (typeof background === 'string') {
        return {
            command: 'magick',
            args: [output, '-background', background, '-flatten', output]
        };
    } else if (background === true) {
        return {
            command: 'composite',
            args: ['-compose', 'Dst_Over', '-tile', 'pattern:checkerboard', output, output]
        };
    }
    return null;
};
