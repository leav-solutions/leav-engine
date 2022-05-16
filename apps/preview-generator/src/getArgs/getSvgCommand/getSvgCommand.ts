// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const getSvgCommand = (input: string, output: string, size: number) => {
    const command = 'inkscape';

    const args = ['-o', output, '-w', size.toString(), '-h', size.toString(), input];

    return {
        command,
        args
    };
};
