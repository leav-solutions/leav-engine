import {Tedis} from 'redis-typescript';

let client: Tedis;

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

export const initRedis = (path: string, inode: number) => {
    return client.set(path, inode.toString());
};

export const updateData = async (path: string, inode: number, oldPath?: string) => {
    if (oldPath) {
        client.del(oldPath);
    }

    return client.set(path, inode.toString());
};

export const deleteData = (path: string) => {
    return client.del(path);
};

export const getInode = async (path: string) => {
    const value = await client.get(path);
    if (value) {
        return parseInt(value.toString(), 10);
    } else {
        console.error(path + ' not found in redis');
        return 0;
    }
};
