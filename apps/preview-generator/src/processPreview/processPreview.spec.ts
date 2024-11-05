// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ConsumeMessage} from 'amqplib';
import {generatePreview} from '../generatePreview/generatePreview';
import {IConfig} from '../types/types';
import {handleCheck} from './../check/handleCheck';
import {processPreview} from './processPreview';

describe('processPreview', () => {
    const content = {
        input: 'test.jpg',
        context: 'context',
        versions: [
            {
                sizes: [
                    {
                        size: 800,
                        output: 'test.png'
                    }
                ]
            }
        ]
    };

    const msg = {
        content: Buffer.from(JSON.stringify(content))
    };

    const config = {
        inputRootPath: '/app',
        outputRootPath: '/app'
    };

    test('process preview', async () => {
        (handleCheck as jest.FunctionLike) = global.__mockPromise();
        (generatePreview as jest.FunctionLike) = global.__mockPromise();

        await processPreview(msg as ConsumeMessage, config as IConfig);

        expect(handleCheck).toBeCalledWith(JSON.parse(msg.content.toString()), config);
        expect(generatePreview).toBeCalled();
    });
});
