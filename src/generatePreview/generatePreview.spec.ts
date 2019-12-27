import {handleDocument} from './../handleDocument/handleDocument';
import {getArgs} from './../getArgs/getArgs';
import {getConfig} from './../getConfig/getConfig';
import {execFile} from 'child_process';
import {generatePreview} from './generatePreview';
import {IMessageConsume} from './../types';

import * as config from '../../config/config_spec.json';

describe('generatePreview', () => {
    console.info = jest.fn();
    (execFile as jest.FunctionLike) = jest.fn(() => '');
    (getArgs as jest.FunctionLike) = jest.fn(() => []);
    (handleDocument as jest.FunctionLike) = jest.fn(() => []);

    (getConfig as jest.FunctionLike) = jest.fn(() => config);

    const msgContent: IMessageConsume = {
        input: 'test.jpg',
        context: 'context',
        versions: [
            {
                sizes: [
                    {
                        size: 200,
                        output: 'test.200.jpg',
                    },
                    {
                        size: 800,
                        output: 'test.800.jpg',
                    },

                    {
                        size: 100,
                        output: 'test.100.jpg',
                    },
                ],
            },
        ],
    };
    test('result generatePreview', async () => {
        const type = 'image';

        const results = await generatePreview(msgContent, type, config);

        const [firstResult] = results;

        expect(firstResult.params.output).toEqual(expect.stringContaining('test.800.jpg'));
        expect(results.length).toBe(3);
        results.map(r => expect(r.error).toBe(0));
    });
});
