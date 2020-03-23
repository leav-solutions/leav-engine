import crypto from 'crypto';
import {create} from './rmq/commands';
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

                if (res > match) {
                    match = res;
                    ddIndex.push(i);
                }
            }

            if (ddIndex.length) {
                dbDir[ddIndex[ddIndex.length - 1]].record.trt = true;
            }

            switch (match) {
                case 5: // move
                case 6: // rename
                case 7: // ignore
                    fsd.trt = true;
                    // dd.record.trt = true;
                    break;
                default:
                    // create // FIXME: TMP
                    await create(
                        fsd.path,
                        fsd.ino,
                        {
                            rootPath: fsd.path,
                            rootKey: 'rootKey',
                            verbose: true,
                            amqp: {
                                channel,
                                exchange: conf.rmq.exchange,
                                routingKey: conf.rmq.routingKey
                            }
                        },
                        true
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
};
