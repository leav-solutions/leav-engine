import {loadConfig} from '@leav/config-manager';
import {getConfig} from './getConfig';

vi.mock('@leav/config-manager');

describe('test getConfig', () => {
    afterAll(() => vi.resetAllMocks());

    test('Memoize config', async () => {
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
                routingKey: 'test',
            },
        };

        const mockLoadConfig = vi.fn(() => config);

        vi.mocked(loadConfig).mockImplementation(mockLoadConfig as any);

        await getConfig();
        await getConfig();

        expect(mockLoadConfig).toBeCalledTimes(1);
    });
});
