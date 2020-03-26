import crypto from 'crypto';
import {create, remove, move} from './rmq/commands';
import config from './config';
import {getChannel} from './rmq';

let dbDir = [];
let fsDir = [];
let dbFiles = [];
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
                    const ddName = dbDir[ddIndex[ddIndex.length - 1]].record.file_name;
                    const ddPath = dbDir[ddIndex[ddIndex.length - 1]].record.file_path;
                    await move(
                        ddPath === '.' ? ddName : `${ddPath}/${ddName}`,
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

const _processFiles = async (level, channel, conf) => {
    // TODO: Add hash

    if (!fsFiles.filter(fsf => fsf.level === level).length) {
        // // delete all untreated files in database
        for (const df of dbFiles.filter(f => typeof f.record.trt === 'undefined')) {
            await remove(
                df.record.file_path === '.' ? df.record.file_name : `${df.record.file_path}/${df.record.file_name}`,
                df.record.inode,
                false, // isDirectory
                channel
            );
        }

        return;
    }

    let match = 0;
    let dfIndex = [];
    for (const fsf of fsFiles) {
        match = 0;
        dfIndex = [];

        if (fsf.level === level && !fsf.trt) {
            for (const [i, df] of dbFiles.entries()) {
                if (typeof df.record.trt === 'undefined') {
                    const res =
                        (fsf.ino === df.record.inode ? 1 : 0) +
                        (fsf.name === df.record.file_name ? 2 : 0) +
                        (fsf.path === df.record.file_path ? 4 : 0);

                    if (res > match && [1, 3, 5, 6, 7].includes(res)) {
                        match = res;
                        dfIndex.push(i);
                    }
                }
            }

            if (dfIndex.length) {
                dbFiles[dfIndex[dfIndex.length - 1]].record.trt = true;
            }

            switch (match) {
                case 1: // identical inode only
                case 3: // move
                case 5: // rename
                case 6: // different inode only (e.g: remount disk)
                    const dbFileName = dbFiles[dfIndex[dfIndex.length - 1]].record.file_name;
                    const dbFilePath = dbFiles[dfIndex[dfIndex.length - 1]].record.file_path;
                    await move(
                        dbFilePath === '.' ? dbFileName : `${dbFilePath}/${dbFileName}`,
                        fsf.path === '.' ? fsf.name : `${fsf.path}/${fsf.name}`,
                        fsf.ino,
                        false, // isDirectory
                        channel
                    );
                    break;
                case 7: // ignore (totally identical)
                    break;
                default:
                    // create
                    await create(
                        fsf.path === '.' ? fsf.name : `${fsf.path}/${fsf.name}`,
                        fsf.ino,
                        false, // isDirectory
                        channel
                    );
                    break;
            }

            fsf.trt = true;
        }
    }

    _processFiles(level + 1, channel, conf);
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
    await _processFiles(0, channel, conf);
};
