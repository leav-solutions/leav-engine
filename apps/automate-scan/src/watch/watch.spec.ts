// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// import {createHash} from 'crypto';
// import {createReadStream} from 'fs';
import {sendToRabbitMQ} from '../rabbitmq/rabbitmq';
import {initRedis} from '../redis/redis';
import {IParamsExtends} from './../types';
import {checkEvent} from './watch';
import {handleCreate, handleDelete, handleMove, handleUpdate} from './events';

const file = './test';
const inode = 123456;
const rootKey = 'rootKey';
const stats = {ino: inode};

jest.mock('chokidar', () => ({
    watch: jest.fn()
}));

jest.mock('crypto', () => ({
    createHash: jest.fn(() => ({digest: jest.fn, update: jest.fn}))
}));

jest.mock('fs', () => ({
    createReadStream: jest.fn(() => ({
        on: jest.fn(() => ({
            on: jest.fn(() => ({
                on: jest.fn((...args) => args[1]())
            }))
        }))
    }))
}));

jest.mock('@leav/utils', () => ({
    isFileAllowed: jest.fn(() => true)
}));

jest.mock('../redis/redis', () => ({
    initRedis: jest.fn(),
    updateData: jest.fn(),
    getInode: jest.fn(() => 123456)
}));

jest.mock('../rabbitmq/rabbitmq', () => ({
    generateMsgRabbitMQ: jest.fn(),
    sendToRabbitMQ: jest.fn()
}));

jest.mock('../', () => ({
    getConfig: global.__mockPromise({
        allowFilesList: '',
        ignoreFilesList: ''
    })
}));

jest.mock('./events', () => ({
    handleCreate: jest.fn(),
    handleDelete: jest.fn(),
    handleMove: jest.fn(),
    handleUpdate: jest.fn()
}));

describe('test checkEvent', () => {
    // disable console info in tests
    console.info = jest.fn();

    afterAll(() => jest.resetAllMocks());

    test('Init - add a file', async () => {
        const params: IParamsExtends = {
            verbose: false,
            ready: false,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('add', file, params, {...stats, isDirectory: jest.fn(() => false)});

        expect(initRedis).toBeCalledWith(file, inode);
        expect(sendToRabbitMQ).not.toBeCalled();
    });

    test('Init - add a folder', async () => {
        const params = {
            verbose: false,
            ready: false,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('addDir', file, params, {...stats, isDirectory: jest.fn(() => true)});

        expect(initRedis).toBeCalledWith(file, inode);
        expect(sendToRabbitMQ).not.toBeCalled();
    });

    test('Add a file', async () => {
        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('add', file, params, {...stats, isDirectory: jest.fn(() => false)});

        expect(handleCreate).toBeCalled();
    });

    test('Add a dir', async () => {
        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('addDir', file, params, {...stats, isDirectory: jest.fn(() => true)});

        expect(handleCreate).toBeCalled();
    });

    test('Unlink a file', async () => {
        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('unlink', file, params, {...stats, isDirectory: jest.fn(() => false)});

        expect(handleDelete).toBeCalled();
    });

    test('Unlink a dir', async () => {
        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('unlinkDir', file, params, {...stats, isDirectory: jest.fn(() => true)});

        expect(handleDelete).toBeCalled();
    });

    test('Update a file', async () => {
        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('change', file, params, {...stats, isDirectory: jest.fn(() => false)});

        expect(handleUpdate).toBeCalled();
    });

    // FIXME: inodesTmp variable should not reset between the two checkEvent calls
    // Because of that it is interpreted as an del and and add instead of a move
    // It works well manually.
    // TODO: add tests on move depending on allow / ignore list

    // test('Move a file', async () => {
    //     const params = {
    //         verbose: false,
    //         ready: true,
    //         timeout: 500,
    //         rootPath: '/files',
    //         rootKey
    //     };

    //     await checkEvent('unlink', file, params, undefined);
    //     await checkEvent('add', file + 1, params, {...stats, isDirectory: jest.fn(() => false)});

    //     expect(handleMove).toBeCalled();
    // });
});
