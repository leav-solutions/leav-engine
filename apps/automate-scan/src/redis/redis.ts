// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Tedis} from 'redis-typescript';

let client: Tedis;

const _slugifyPath = (path: string): string =>
    path
        .toString()
        .trim()
        .normalize('NFD') // split accents and base letter
        .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents to leave only base letters
        .replace(/[^a-zA-Z0-9\-_\/\.]/g, '_') // keep only letters, numbers, underscores, dashes, points and slashes
        .replace(/_{2,}/g, '_'); // replace all __, ___, ... with a single _
const _getRedisKey = (path: string): string => {
    const prefix = 'automate_scan';
    const key = `${prefix}:${_slugifyPath(path)}`;

    return key;
};

export const createClient = (host: string, port: number) => {
    client = new Tedis({
        host,
        port
    });

    client.on('connect', () => undefined);

    client.on('error', err => {
        console.error('201 - Error with redis', err);
        process.exit(201);
    });

    return client;
};

export const setData = async (path: string, inode: number) => client.set(_getRedisKey(path), inode.toString());

export const updateData = async (path: string, inode: number, oldPath?: string) => {
    if (oldPath) {
        client.del(_getRedisKey(oldPath));
    }

    return client.set(_getRedisKey(path), inode.toString());
};

export const deleteData = (path: string) => client.del(_getRedisKey(path));

export const getInode = async (path: string) => {
    const value = await client.get(_getRedisKey(path));
    if (value) {
        return parseInt(value.toString(), 10);
    } else {
        console.error(_getRedisKey(path) + ' not found in redis');
        return 0;
    }
};
