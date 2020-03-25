import crypto from 'crypto';
import {create, remove, move} from './rmq/commands';
import config from './config';
import {getChannel} from './rmq';

let dbDir = [];
let dbFiles = [];
let fsDir = [];
let fsFiles = [];

const _splitDatabaseElem = async database => {
    let toList = [];

    const dir = database.filter(e => e.record.is_directory);
    const fil = database.filter(e => !e.record.is_directory);

    dbDir = dbDir.concat(dir);
    dbFiles = dbFiles.concat(fil);

    for (const d of dir) {
        toList = toList.concat(d.children);
        delete d.children;
    }

    if (toList.length) {
        _splitDatabaseElem(toList);
    }

    return;
};

const _splitFilesystemElem = async filesystem => {
    fsDir = filesystem.filter(e => e.type === 'directory');
    fsFiles = filesystem.filter(e => e.type === 'file');
};

const _processDirs = async (level, channel, conf) => {
    if (!fsDir.filter(fsd => fsd.level === level).length) {
        // delete all untreated directories in database
        for (const dd of dbDir.filter(d => typeof d.record.trt === 'undefined')) {
            console.log('remove');
            await remove(
                dd.record.file_path === '.' ? dd.record.file_name : `${dd.record.file_path}/${dd.record.file_name}`,
                dd.record.inode,
                true, // isDirectory
                channel
            );
        }

        return;
    }

    let match = 0;
    let ddIndex = [];
    for (const fsd of fsDir) {
        match = 0;
        ddIndex = [];

        if (fsd.level === level && !fsd.trt) {
            for (const [i, dd] of dbDir.entries()) {
                if (typeof dd.record.trt === 'undefined') {
                    const res =
                        (fsd.ino === dd.record.inode ? 1 : 0) +
                        (fsd.name === dd.record.file_name ? 2 : 0) +
                        (fsd.path === dd.record.file_path ? 4 : 0);

                    if (res > match && [1, 3, 5, 6, 7].includes(res)) {
                        match = res;
                        ddIndex.push(i);
                    }
                }
            }

            if (ddIndex.length) {
                dbDir[ddIndex[ddIndex.length - 1]].record.trt = true;
            }

            switch (match) {
                case 1: // identical inode only
                case 3: // move
                case 5: // rename
                case 6: // different inode only (e.g: remount disk)
                    const dbFileName = dbDir[ddIndex[ddIndex.length - 1]].record.file_name;
                    const dbFilePath = dbDir[ddIndex[ddIndex.length - 1]].record.file_path;
                    await move(
                        dbFilePath === '.' ? dbFileName : `${dbFilePath}/${dbFileName}`,
                        fsd.path === '.' ? fsd.name : `${fsd.path}/${fsd.name}`,
                        fsd.ino,
                        true, // isDirectory
                        channel
                    );
                    break;
                case 7: // ignore (totally identical)
                    break;
                default:
                    // create
                    await create(
                        fsd.path === '.' ? fsd.name : `${fsd.path}/${fsd.name}`,
                        fsd.ino,
                        true, // isDirectory
                        channel
                    );
                    break;
            }

            fsd.trt = true;
        }
    }

    _processDirs(level + 1, channel, conf);
};

export default async (filesystem, database) => {
    const conf = await config;

    await _splitDatabaseElem(database);
    await _splitFilesystemElem(filesystem);

    const channel = await getChannel(
        {
            protocol: conf.rmq.protocol,
            hostname: conf.rmq.hostname,
            username: conf.rmq.username,
            password: conf.rmq.password
        },
        conf.rmq.exchange,
        conf.rmq.queue,
        conf.rmq.routingKey,
        conf.rmq.type
    );

    await _processDirs(0, channel, conf);

    // console.log(dbDir);
};
