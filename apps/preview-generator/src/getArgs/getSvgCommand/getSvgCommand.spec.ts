// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getSvgCommand} from './getSvgCommand';
describe('test getSvgCommand', () => {
    test('command and args return', () => {
        const input = 'test.svg';
        const output = 'test.png';
        const size = 800;

        const {command, args} = getSvgCommand(input, output, size);

        expect(command).toBe('inkscape');
        expect(args).toEqual(expect.arrayContaining([input, output, size.toString()]));
    });
});
