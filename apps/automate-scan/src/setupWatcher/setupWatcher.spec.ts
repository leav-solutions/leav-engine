// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {startWatch} from './setupWatcher';
import {start} from '../watch/watch';

jest.mock('redis-typescript');

jest.mock('../watch/watch', () => ({
    start: jest.fn()
}));

jest.mock('../', () => ({
    getConfig: global.__mockPromise({
        rootPath: '',
        redis: {
            host: 'test',
            port: 1234
        }
    })
}));

jest.mock('./../redis/redis', () => ({
    createClient: jest.fn()
}));

jest.mock('fs', () => ({
    existsSync: jest.fn(() => true)
}));

describe('test init', () => {
    console.info = jest.fn();

    test('startWatch', async () => {
        await startWatch();

        expect(start).toBeCalledTimes(1);
    });
});
