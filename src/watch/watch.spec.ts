import {sendToRabbitMQ} from '../rabbitmq/rabbitmq';
import {initRedis} from '../redis/redis';
import {IParamsExtends} from './../types';
import {checkEvent, manageIsDirectory} from './watch';

const file = './test';
const inode = 123456;
const rootKey = 'rootKey';
const stats = {ino: inode};

jest.mock('../index');
jest.mock('../redis/redis');

describe('test checkEvent', () => {
    // disable console info in tests
    console.info = jest.fn();

    test('Init - add a file', async () => {
        (initRedis as jest.FunctionLike) = jest.fn();
        (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

        const params: IParamsExtends = {
            verbose: false,
            ready: false,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('add', file, stats, params);

        expect(initRedis).toBeCalledWith(file, inode);
        expect(sendToRabbitMQ).not.toBeCalled();
    });

    test('Init - add a folder', async () => {
        (initRedis as jest.FunctionLike) = jest.fn();
        (sendToRabbitMQ as jest.FunctionLike) = jest.fn();

        const params = {
            verbose: false,
            ready: false,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('addDir', file, stats, params);

        expect(initRedis).toBeCalledWith(file, inode);
        expect(sendToRabbitMQ).not.toBeCalled();
    });

    test('Add a file', async () => {
        (sendToRabbitMQ as jest.FunctionLike) = jest.fn();
        (manageIsDirectory as jest.FunctionLike) = jest.fn();

        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('add', file, stats, params);

        expect(sendToRabbitMQ).toBeCalledWith(
            expect.stringContaining('create') &&
                expect.stringContaining(file) &&
                expect.stringContaining(inode.toString()) &&
                expect.stringContaining(rootKey),
            undefined
        );
    });

    test('Add a dir', async () => {
        (sendToRabbitMQ as jest.FunctionLike) = jest.fn();
        (manageIsDirectory as jest.FunctionLike) = jest.fn();

        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('addDir', file, stats, params);

        expect(sendToRabbitMQ).toBeCalledWith(
            expect.stringContaining('create') &&
                expect.stringContaining(file) &&
                expect.stringContaining(inode.toString()) &&
                expect.stringContaining(rootKey),
            undefined
        );
    });

    test('Unlink a file', async () => {
        (sendToRabbitMQ as jest.FunctionLike) = jest.fn();
        (manageIsDirectory as jest.FunctionLike) = jest.fn();

        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('unlink', file, stats, params);

        expect(sendToRabbitMQ).toBeCalledWith(
            expect.stringContaining('delete') &&
                expect.stringContaining(file) &&
                expect.stringContaining(inode.toString()) &&
                expect.stringContaining(rootKey),
            undefined
        );
    });

    test('Unlink a dir', async () => {
        (sendToRabbitMQ as jest.FunctionLike) = jest.fn();
        (manageIsDirectory as jest.FunctionLike) = jest.fn();

        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('unlinkDir', file, stats, params);

        expect(sendToRabbitMQ).toBeCalledWith(
            expect.stringContaining('delete') &&
                expect.stringContaining(file) &&
                expect.stringContaining(inode.toString()) &&
                expect.stringContaining(rootKey),
            undefined
        );
    });

    test('Update a file', async () => {
        (sendToRabbitMQ as jest.FunctionLike) = jest.fn();
        (manageIsDirectory as jest.FunctionLike) = jest.fn();

        const params = {
            verbose: false,
            ready: true,
            timeout: 0,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('change', file, stats, params);

        expect(sendToRabbitMQ).toBeCalledWith(
            expect.stringContaining('update') &&
                expect.stringContaining(file) &&
                expect.stringContaining(inode.toString()) &&
                expect.stringContaining(rootKey),
            undefined
        );
    });

    test('Move a file', async () => {
        (sendToRabbitMQ as jest.FunctionLike) = jest.fn();
        (manageIsDirectory as jest.FunctionLike) = jest.fn();

        const params = {
            verbose: false,
            ready: true,
            timeout: 500,
            rootPath: '/files',
            rootKey
        };

        await checkEvent('unlink', file, stats, params);
        await checkEvent('add', file + 1, stats, params);

        expect(sendToRabbitMQ).toBeCalledWith(
            expect.stringContaining('move') &&
                expect.stringContaining(file) &&
                expect.stringContaining(inode.toString()) &&
                expect.stringContaining(rootKey),
            undefined
        );
    });
});
