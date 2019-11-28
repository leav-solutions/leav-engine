import {ConsumeMessage} from 'amqplib';
import {getMsgContent} from './getMsgContent';

describe('getMsgContent', () => {
    test('get msg content in object', () => {
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

        const result = getMsgContent(msg as ConsumeMessage);

        expect(result).not.toBeNull();
    });
});
