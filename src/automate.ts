import {FullTreeContent, Record} from './_types/queries';
import {FilesystemContent} from './_types/filesystem';
import {create, remove, move, update} from './rmq/events';
import * as amqp from 'amqplib';

let dbElems: FullTreeContent;
let fsElems: FilesystemContent;

enum Attr {
    NOTHING = 0,
    INODE = 1,
    NAME = 2,
    PATH = 4
}

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
    try {
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

        let match: Attr = 0;
        let deIndex: number[] = [];
        for (const fse of fsElems) {
            match = Attr.NOTHING;
            deIndex = [];

            if (fse.level === level && !fse.trt) {
                for (const [i, de] of dbElems.entries()) {
                    if (typeof de.record.trt === 'undefined') {
                        const res: number =
                            (fse.ino === de.record.inode ? Attr.INODE : 0) +
                            (fse.name === de.record.file_name ? Attr.NAME : 0) +
                            (fse.path === de.record.file_path ? Attr.PATH : 0);

                        if (res > match && [1, 3, 5, 6, 7].includes(res)) {
                            match = res;
                            deIndex.push(i);
                        }
                    }
                }

                if (deIndex.length) {
                    dbElems[deIndex[deIndex.length - 1]].record.trt = true;

                    // if hashs are differents, it's a move and not an ignore event
                    if (
                        match === Attr.INODE + Attr.NAME + Attr.PATH &&
                        dbElems[deIndex[deIndex.length - 1]].record.hash !== fse.hash
                    ) {
                        match = 8;
                    }
                }

                switch (match) {
                    case Attr.INODE: // Identical inode only
                    case Attr.INODE + Attr.NAME: // 3 - move
                    case Attr.INODE + Attr.PATH: // 5 - name
                    case Attr.NAME + Attr.PATH: // different inode only (e.g: remount disk)
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
                    case Attr.INODE + Attr.NAME + Attr.PATH: // 7 - ignore (totally identical)
                        break;
                    case 8: // hash changed
                        await update(
                            fse.path === '.' ? fse.name : `${fse.path}/${fse.name}`,
                            fse.ino,
                            false, // isDirectory,
                            channel,
                            fse.hash
                        );
                        break;
                    default:
                        // 0 or Attr.PATH - create
                        await create(
                            fse.path === '.' ? fse.name : `${fse.path}/${fse.name}`,
                            fse.ino,
                            fse.type === 'directory' ? true : false,
                            channel,
                            fse.hash
                        );
                        break;
                }

                fse.trt = true;
            }
        }

        await _process(level + 1, channel);
    } catch (e) {
        throw e;
    }
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
