// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IExec} from '../../types/types';

export const getVideoArgs = (input: string, output: string, size: number): IExec[] => {
    const command = 'ffmpeg';
    const args = [
        '-y',
        '-i',
        input,
        '-vf',
        'thumbnail,scale=' + size + ':-1', // -1 allow to keep the ratio from the source
        '-frames:v',
        '1',
        output
    ];

    return [
        {
            command,
            args
        }
    ];
};
