import {handleCheck} from './../check/handleCheck';
import {getMsgContent} from './getMsgContent/getMsgContent';
import {IConfig, ErrorList} from './../types';
import {ConsumeMessage} from 'amqplib';
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
                        output: 'test.png',
                    },
                ],
            },
        ],
    };

    const msg = {
        content: Buffer.from(JSON.stringify(content)),
    };

    const config = {
        rootPath: '/app',
    };

    test('use getMsgContent', () => {
        (getMsgContent as jest.FunctionLike) = jest.fn(() => msg);
        (handleCheck as jest.FunctionLike) = jest.fn();

        processPreview(msg as ConsumeMessage, config as IConfig);

        expect(getMsgContent).toBeCalledWith(msg);
    });

    test('use handleCheck', () => {
        (getMsgContent as jest.FunctionLike) = jest.fn(() => msg);
        (handleCheck as jest.FunctionLike) = jest.fn();

        processPreview(msg as ConsumeMessage, config as IConfig);

        expect(handleCheck).toBeCalledWith(msg, config.rootPath);
    });
});
