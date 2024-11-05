// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getArgs} from './../../getArgs/getArgs';
import {execute, IExecute} from './execute';

describe('execute', () => {
    const output = '/data/test.png';
    const density = 300;
    const background = false;
    const name = 'test';

    const size = {
        output,
        size: 800,
        name
    };

    const params: Mockify<IExecute> = {
        size,
        version: {
            background,
            density,
            sizes: [size]
        }
    };
    test('should throw', () => {
        const commands = [
            {
                command: 'test',
                args: []
            }
        ];
        (getArgs as jest.FunctionLike) = jest.fn(() => commands);
        (console.error as jest.FunctionLike) = jest.fn();

        execute(params as IExecute).catch(e => {
            expect(e.error).toBe(501);
            expect(e.params).toEqual(
                expect.objectContaining({
                    size: size.size,
                    output,
                    density,
                    name,
                    background
                })
            );
        });
    });
});
