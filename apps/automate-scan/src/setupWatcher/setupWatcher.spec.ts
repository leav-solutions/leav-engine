// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {existsSync} from 'fs';
import {start} from '../watch/watch';
import {createClient} from './../redis/redis';
import {getChannel, getConfig, startWatch} from './setupWatcher';

jest.mock('redis-typescript');

describe('test init', () => {
    console.info = jest.fn();

    test('startWatch', async () => {
        // block use of rabbitmq
        (getChannel as jest.FunctionLike) = jest.fn();
        (start as jest.FunctionLike) = jest.fn();
        (getConfig as jest.FunctionLike) = jest.fn(() => ({
            rootPath: '',
            redis: {
                host: 'test',
                port: 1234
            }
        }));
        (existsSync as jest.FunctionLike) = jest.fn(() => true);
        (createClient as jest.FunctionLike) = jest.fn();

        await startWatch();

        expect(start).toBeCalled();
    });
});
