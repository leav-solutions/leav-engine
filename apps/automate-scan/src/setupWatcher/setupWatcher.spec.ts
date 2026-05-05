// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
