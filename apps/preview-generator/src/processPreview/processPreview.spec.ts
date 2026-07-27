import {type IAmqpMessage} from '@leav/message-broker';
import {generatePreview} from '../generatePreview/generatePreview';
import {type IConfig} from '../types/types';
import {handleCheck} from './../check/handleCheck';
import {processPreview} from './processPreview';

vi.mock('../check/handleCheck');
vi.mock('../generatePreview/generatePreview');

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
        inputRootPath: '/app',
        outputRootPath: '/app',
    };

    test('process preview', async () => {
        vi.mocked(handleCheck).mockReturnValue(Promise.resolve(undefined));
        vi.mocked(generatePreview).mockReturnValue(Promise.resolve(undefined));

        await processPreview(msg as IAmqpMessage, config as IConfig);

        expect(handleCheck).toBeCalledWith(JSON.parse(msg.content.toString()), config);
        expect(generatePreview).toBeCalled();
    });
});
