import {execFileSync} from 'child_process';
import {generatePreview} from './generatePreview';
import {IMessageConsume} from './../types';

import * as config from '../../config/config_spec.json';

describe('generatePreview', () => {
    console.info = jest.fn();
    (execFileSync as jest.FunctionLike) = jest.fn();

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
    const type = 'image';

    const results = generatePreview(msgContent, type, config);

    test('first results ', () => {
        const [firstResult] = results;
        expect(firstResult.params.output).toBe('test.800.jpg');
    });

    test('results length and error', () => {
        expect(results.length).toBe(3);
        results.map(r => expect(r.error).toBe(0));
    });
});
