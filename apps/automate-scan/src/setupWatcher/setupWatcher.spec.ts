import {startWatch} from './setupWatcher';
import {start} from '../watch/watch';

vi.mock('redis');

vi.mock('../watch/watch', () => ({
    start: vi.fn(),
}));

vi.mock('../config', () => ({
    getConfig: global.__mockPromise({
        rootPath: '',
        redis: {
            host: 'test',
            port: 1234,
        },
    }),
}));

vi.mock('./../redis/redis', () => ({
    createClient: vi.fn(),
}));

vi.mock('fs', () => ({
    existsSync: vi.fn(() => true),
}));

describe('test init', () => {
    test('startWatch', async () => {
        await startWatch();

        expect(start).toBeCalledTimes(1);
    });
});
