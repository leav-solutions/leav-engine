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

const _processing = async (level, channel, conf) => {
    if (!fsDir.filter(fsd => fsd.level === level).length) {
        return;
    }

    // same inode: 1
    // same name: 2
    // same path: 4

    let match = 0;
    let ddIndex = [];

    for (const fsd of fsDir) {
        match = 0;
        ddIndex = [];

        if (fsd.level === level && !fsd.trt) {
            for (const [i, dd] of dbDir.entries()) {
                const res =
                    (fsd.ino === dd.record.inode ? 1 : 0) +
                    (fsd.name === dd.record.file_name ? 2 : 0) +
                    (fsd.path === dd.record.file_path ? 4 : 0);

                if (res > match && [3, 5, 7].includes(res)) {
                    match = res;
                    ddIndex.push(i);
                }
            }

            if (ddIndex.length) {
                dbDir[ddIndex[ddIndex.length - 1]].record.trt = true;
            }

            switch (match) {
                case 5: // rename
                    console.log('rename');
                    await move(
                        dbDir[ddIndex[ddIndex.length - 1]].record.file_path === '.'
                            ? dbDir[ddIndex[ddIndex.length - 1]].record.file_name
                            : `${dbDir[ddIndex[ddIndex.length - 1]].record.file_path}/${
                                  dbDir[ddIndex[ddIndex.length - 1]].record.file_name
                              }`,
                        fsd.path === '.' ? fsd.name : `${fsd.path}/${fsd.name}`,
                        fsd.ino,
                        true, // isDirectory
                        channel
                    );
                    break;
                case 3: // move
                    console.log('move');
                    break;
                case 7: // ignore
                    fsd.trt = true;
                    break;
                default:
                    // create
                    console.log('create');
                    await create(
                        fsd.path === '.' ? fsd.name : `${fsd.path}/${fsd.name}`,
                        fsd.ino,
                        true, // isDirectory
                        channel
                    );
                    break;
            }
        }
    }

    _processing(level + 1, channel, conf);
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

    await _processing(0, channel, conf);
    // TODO: deleted elements

    // console.log(dbDir);
};
