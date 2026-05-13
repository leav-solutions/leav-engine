import {getConfig} from '../config';
import {sendToRabbitMQ} from '../rabbitmq/rabbitmq';
import {setData} from '../redis/redis';
import {type IParamsExtends} from './../types';
import {handleCreate, handleDelete, handleMove, handleUpdate} from './events';
import {checkEvent} from './watch';

const file = 'test';
const inode = 123456;
const rootKey = 'rootKey';
const stats = {ino: inode};

vi.mock('chokidar', () => ({
    watch: vi.fn(),
}));

vi.mock('crypto', () => ({
    createHash: vi.fn(() => ({digest: vi.fn(), update: vi.fn()})),
}));

vi.mock('fs', () => ({
    createReadStream: vi.fn(() => ({
        on: vi.fn(() => ({
            on: vi.fn(() => ({
                on: vi.fn((...args) => args[1]()),
            })),
        })),
    })),
}));

vi.mock('../redis/redis', () => ({
    setData: vi.fn(),
    updateData: vi.fn(),
    getInode: vi.fn(() => 123456),
}));

vi.mock('../rabbitmq/rabbitmq', () => ({
    generateMsgRabbitMQ: vi.fn(),
    sendToRabbitMQ: vi.fn(),
}));

vi.mock('../config', () => ({
    getConfig: global.__mockPromise({
        allowFilesList: '',
        ignoreFilesList: '',
        rootPath: '/files',
    }),
}));

vi.mock('./events', () => ({
    handleCreate: vi.fn(),
    handleDelete: vi.fn(),
    handleMove: vi.fn(),
    handleUpdate: vi.fn(),
}));

describe('test checkEvent', () => {
    afterAll(() => vi.resetAllMocks());

    test('Init - add a file', async () => {
        const params: IParamsExtends = {
            ready: false,
            rootPath: '/files',
            rootKey,
        };

        await checkEvent('add', file, params, {...stats, isDirectory: vi.fn(() => false)});

        expect(setData).toBeCalledWith(file, inode);
        expect(sendToRabbitMQ).not.toBeCalled();
    });

    test('Init - add a folder', async () => {
        const params = {
            ready: false,
            timeout: 0,
            rootPath: '/files',
            rootKey,
        };

        await checkEvent('addDir', file, params, {...stats, isDirectory: vi.fn(() => true)});

        expect(setData).toBeCalledWith(file, inode);
        expect(sendToRabbitMQ).not.toBeCalled();
    });

    test('Add a file', async () => {
        const params = {
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey,
        };

        await checkEvent('add', file, params, {...stats, isDirectory: vi.fn(() => false)});

        expect(handleCreate).toBeCalled();
    });

    test('Add a dir', async () => {
        const params = {
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey,
        };

        await checkEvent('addDir', file, params, {...stats, isDirectory: vi.fn(() => true)});

        expect(handleCreate).toBeCalled();
    });

    test('Unlink a file', async () => {
        const params = {
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey,
        };

        await checkEvent('unlink', file, params, {...stats, isDirectory: vi.fn(() => false)});

        expect(handleDelete).toBeCalled();
    });

    test('Unlink a dir', async () => {
        const params = {
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey,
        };

        await checkEvent('unlinkDir', file, params, {...stats, isDirectory: vi.fn(() => true)});

        expect(handleDelete).toBeCalled();
    });

    test('Update a file', async () => {
        const params = {
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey,
        };

        await checkEvent('change', file, params, {...stats, isDirectory: vi.fn(() => false)});

        expect(handleUpdate).toBeCalled();
    });

    test('Move a file', async () => {
        expect.assertions(1);

        const params = {
            ready: true,
            rootPath: '/files',
            rootKey,
            delay: 1100,
        };

        // not use await for unlink
        checkEvent('unlink', file, params, undefined);
        await checkEvent('add', file + 1, params, {...stats, isDirectory: vi.fn(() => false)});

        expect(handleMove).toBeCalled();
    });

    test('Move a file -> hidden to no hidden', async () => {
        vi.mocked(getConfig).mockReturnValue(
            Promise.resolve({
                allowFilesList: '',
                ignoreFilesList: file,
                rootPath: '/files',
            }),
        );

        const params = {
            ready: true,
            rootPath: '/files',
            rootKey,
            delay: 1100,
        };

        // not use await for unlink
        checkEvent('unlink', file, params, undefined);
        await checkEvent('add', file + 1, params, {...stats, isDirectory: vi.fn(() => false)});

        expect(handleCreate).toBeCalled();
    });

    test('Move a file -> not hidden to hidden', async () => {
        vi.mocked(getConfig).mockReturnValue(
            Promise.resolve({
                allowFilesList: '',
                ignoreFilesList: file + 1,
                rootPath: '/files',
            }),
        );

        const params = {
            ready: true,
            rootPath: '/files',
            rootKey,
            delay: 1100,
        };

        // not use await for unlink
        checkEvent('unlink', file, params, undefined);
        await checkEvent('add', file + 1, params, {...stats, isDirectory: vi.fn(() => false)});

        expect(handleDelete).toBeCalled();
    });
});
