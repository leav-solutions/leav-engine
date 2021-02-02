// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import {IConfig, IMessageConsume} from '../types/types';
import {getArgs} from './../getArgs/getArgs';
import {getConfig} from './../getConfig/getConfig';
import {handleDocument} from './../handleDocument/handleDocument';
import {generatePreview} from './generatePreview';

describe('generatePreview', () => {
    const mockconf = {inputRootPath: 'input_path', outputRootPath: 'output_path', amqp: {hostname: 'localhost'}};

    console.info = jest.fn();
    (execFile as jest.FunctionLike) = jest.fn(() => '');
    (getArgs as jest.FunctionLike) = jest.fn(() => []);
    (handleDocument as jest.FunctionLike) = jest.fn(() => []);

    (getConfig as jest.FunctionLike) = jest.fn(() => mockconf);

    const msgContent: IMessageConsume = {
        input: 'test.jpg',
        context: 'context',
        versions: [
            {
                sizes: [
                    {
                        size: 200,
                        output: 'test.200.jpg',
                        name: 'small'
                    },
                    {
                        size: 800,
                        output: 'test.800.jpg',
                        name: 'big'
                    },

                    {
                        size: 100,
                        output: 'test.100.jpg',
                        name: 'very_small'
                    }
                ]
            }
        ]
    };
    test('result generatePreview', async () => {
        const type = 'image';

        const results = await generatePreview(msgContent, type, mockconf as IConfig);
        const firstResult = results[0];

        expect(firstResult.params.output).toEqual(expect.stringContaining('test.800.jpg'));
        expect(results.length).toBe(3);
        results.map(r => expect(r.error).toBe(0));
    });
});
