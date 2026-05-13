import {execFile} from 'child_process';
import {type IConfig, type IMessageConsume} from '../types/types';
import {getArgs} from './../getArgs/getArgs';
import {getConfig} from './../getConfig/getConfig';
import {handleDocument} from './../handleDocument/handleDocument';
import {generatePreview} from './generatePreview';

vi.mock('child_process', () => ({execFile: vi.fn(() => '')}));
vi.mock('../getArgs/getArgs', () => ({getArgs: vi.fn(() => [])}));
vi.mock('../handleDocument/handleDocument', () => ({handleDocument: vi.fn(() => [])}));
vi.mock('../getConfig/getConfig');

describe('generatePreview', () => {
    const mockconf = {inputRootPath: 'input_path', outputRootPath: 'output_path', amqp: {hostname: 'localhost'}};

    const msgContent: IMessageConsume = {
        input: 'test.jpg',
        context: 'context',
        versions: [
            {
                sizes: [
                    {
                        size: 200,
                        output: 'test.200.jpg',
                        name: 'small',
                    },
                    {
                        size: 800,
                        output: 'test.800.jpg',
                        name: 'big',
                    },

                    {
                        size: 100,
                        output: 'test.100.jpg',
                        name: 'very_small',
                    },
                ],
            },
        ],
    };
    test('result generatePreview', async () => {
        vi.mocked(getConfig).mockResolvedValue(mockconf as any);
        const type = 'image';

        const results = await generatePreview(msgContent, type, mockconf as IConfig);
        const firstResult = results[0];

        expect(firstResult.params.output).toEqual(expect.stringContaining('test.800.jpg'));
        expect(results.length).toBe(3);
        results.map(r => expect(r.error).toBe(0));
    });
});
