import * as fs from 'fs';
import {getConfig} from './getConfig';

describe('test getConfig', () => {
    test('give config return config', () => {
        const config = {
            rootPath: 'test',
            ICCPath: 'test',
            amqp: {
                protocol: 'test',
                hostname: 'test',
                port: 0,
                username: 'test',
                password: 'test',
                queue: 'test',
                exchange: 'test',
                routingKey: 'test'
            }
        };

        const configPath = './test.json';

        (fs.existsSync as jest.FunctionLike) = jest.fn(() => true);
        (fs.readFileSync as jest.FunctionLike) = jest.fn(() => JSON.stringify(config));

        const newConfig = getConfig(configPath);

        expect(newConfig).toEqual(config);
    });
});
