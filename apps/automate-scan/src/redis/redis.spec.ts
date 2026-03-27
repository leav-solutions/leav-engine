// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const redisClient = {
    connect: jest.fn(),
    on: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    get: jest.fn(),
};
const redisMock = jest.mock('./', () => ({
    createClient: () => redisClient,
}));

import {createClient, deleteData, getInode, setData, updateData} from './redis';

const path = "./test with special' characters éàè";
const redisKey = 'automate_scan:./test_with_special_characters_eae';
const inode = 1234;

describe('test redis functions', () => {
    beforeEach(() => jest.clearAllMocks());

    test('createClient', async () => {
        const host = '127.0.0.1';
        const port = 6379;
        const client = await createClient(host, port);

        expect(client).not.toBeUndefined();
    });

    test('initRedis', async () => {
        await setData(path, inode);

        expect(redisClient.set).toBeCalled();
        expect(redisClient.set.mock.calls[0][0]).toBe(redisKey);
    });

    test('updateData without oldPath', async () => {
        await updateData(path, inode);

        expect(redisClient.set).toBeCalled();
        expect(redisClient.set.mock.calls[0][0]).toBe(redisKey);
        expect(redisClient.del).not.toBeCalled();
    });

    test('updateData with oldPath', async () => {
        await updateData(path, inode, path + 1);

        expect(redisClient.set).toBeCalled();
        expect(redisClient.set.mock.calls[0][0]).toBe(redisKey);
        expect(redisClient.del).toBeCalled();
        expect(redisClient.del.mock.calls[0][0]).toBe(redisKey + 1);
    });

    test('deleteData', async () => {
        await deleteData(path);

        expect(redisClient.del).toBeCalled();
        expect(redisClient.del.mock.calls[0][0]).toBe(redisKey);
    });

    test('getInode', async () => {
        await getInode(path); // Will trigger an console.error

        expect(redisClient.get).toBeCalled();
        expect(redisClient.get.mock.calls[0][0]).toBe(redisKey);
    });
});
