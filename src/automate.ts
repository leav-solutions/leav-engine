import {FullTreeContent, Record} from './_types/queries';
import {FilesystemContent} from './_types/filesystem';
import {create, remove, move} from './rmq/commands';
import * as amqp from 'amqplib';

let dbElems: FullTreeContent;
let fsElems: FilesystemContent;

const _extractChildrenDbElems = async (database: FullTreeContent): Promise<void> => {
    let toList: FullTreeContent = [];
    dbElems = typeof dbElems !== 'undefined' ? dbElems.concat(database) : database;

    for (const e of database) {
        if (e.record.is_directory && e.children.length) {
            toList = toList.concat(e.children);
        }

        delete e.children;
    }

    if (toList.length) {
        await _extractChildrenDbElems(toList);
    }

    return;
};

const _process = async (level: number, channel: amqp.Channel): Promise<void> => {
    // TODO: Add hash for files

    if (!fsElems.filter(fse => fse.level === level).length) {
        // delete all untreated elements in database
        for (const de of dbElems.filter(e => typeof e.record.trt === 'undefined')) {
            await remove(
                de.record.file_path === '.' ? de.record.file_name : `${de.record.file_path}/${de.record.file_name}`,
                de.record.inode,
                de.record.is_directory,
                channel
            );
        }

        return;
    }

    let match: number = 0;
    let deIndex: number[] = [];
    for (const fse of fsElems) {
        match = 0;
        deIndex = [];

        if (fse.level === level && !fse.trt) {
            for (const [i, de] of dbElems.entries()) {
                if (typeof de.record.trt === 'undefined') {
                    const res: number =
                        (fse.ino === de.record.inode ? 1 : 0) +
                        (fse.name === de.record.file_name ? 2 : 0) +
                        (fse.path === de.record.file_path ? 4 : 0);

                    if (res > match && [1, 3, 5, 6, 7].includes(res)) {
                        match = res;
                        deIndex.push(i);
                    }
                }
            }

            if (deIndex.length) {
                dbElems[deIndex[deIndex.length - 1]].record.trt = true;
            }

            switch (match) {
                case 1: // identical inode only
                case 3: // move
                case 5: // rename
                case 6: // different inode only (e.g: remount disk)
                    const deName: string = dbElems[deIndex[deIndex.length - 1]].record.file_name;
                    const dePath: string = dbElems[deIndex[deIndex.length - 1]].record.file_path;
                    await move(
                        dePath === '.' ? deName : `${dePath}/${deName}`,
                        fse.path === '.' ? fse.name : `${fse.path}/${fse.name}`,
                        fse.ino,
                        fse.type === 'directory' ? true : false,
                        channel
                    );
                    break;
                case 7: // ignore (totally identical)
                    break;
                default:
                    // create
                    await create(
                        fse.path === '.' ? fse.name : `${fse.path}/${fse.name}`,
                        fse.ino,
                        fse.type === 'directory' ? true : false,
                        channel
                    );
                    break;
            }

            fse.trt = true;
        }
    }

    await _process(level + 1, channel);
};

export default async (fsScan: FilesystemContent, dbScan: FullTreeContent, channel: amqp.Channel): Promise<void> => {
    fsElems = fsScan;

    try {
        await _extractChildrenDbElems(dbScan);
        await _process(0, channel);
    } catch (e) {
        throw e;
    }
};
