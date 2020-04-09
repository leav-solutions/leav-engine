import {FullTreeContent} from './_types/queries';
import {FilesystemContent, FileContent} from './_types/filesystem';
import {create, remove, move, update} from './rmq/events';
import * as amqp from 'amqplib';

enum Attr {
    NOTHING = 0,
    INODE = 1,
    NAME = 2,
    PATH = 4
}

const _extractChildrenDbElems = (database: FullTreeContent, dbEl: FullTreeContent): FullTreeContent => {
    let toList: FullTreeContent = [];

    for (const e of database) {
        if (e.record.is_directory && e.children.length) {
            toList = toList.concat(e.children);
        }

        delete e.children;
    }

    dbEl = typeof dbEl !== 'undefined' ? dbEl.concat(database) : database;

    if (toList.length) {
        return _extractChildrenDbElems(toList, dbEl);
    }

    return dbEl;
};

const _getEventTypeAndDbElIdx = async (fc: FileContent, dbEl: FullTreeContent) => {
    let match = Attr.NOTHING;
    const dbElIdx = [];

    for (const [i, e] of dbEl.entries()) {
        if (typeof e.record.trt === 'undefined') {
            const res: number =
                (fc.ino === e.record.inode ? Attr.INODE : 0) +
                (fc.name === e.record.file_name ? Attr.NAME : 0) +
                (fc.path === e.record.file_path ? Attr.PATH : 0);

            if (res > match && [1, 3, 5, 6, 7].includes(res)) {
                match = res;
                dbElIdx.push(i);
            }
        }
    }

    if (dbElIdx.length) {
        dbEl[dbElIdx[dbElIdx.length - 1]].record.trt = true;

        // if hashs are differents, it's a move and not an ignore event
        if (match === Attr.INODE + Attr.NAME + Attr.PATH && dbEl[dbElIdx[dbElIdx.length - 1]].record.hash !== fc.hash) {
            match = 8;
        }
    }

    return {match, dbElIdx};
};

const _delUntrtDbEl = async (dbEl: FullTreeContent, channel: amqp.Channel): Promise<void> => {
    // console.log('BEFORE DEL dbEl:', dbEl);
    for (const de of dbEl.filter(e => typeof e.record.trt === 'undefined')) {
        await remove(
            de.record.file_path === '.' ? de.record.file_name : `${de.record.file_path}/${de.record.file_name}`,
            de.record.inode,
            de.record.is_directory,
            channel
        );
    }
};

const _trtFile = async (
    match: Attr,
    dbElIdx: number[],
    dbEl: FullTreeContent,
    fc: FileContent,
    channel: amqp.Channel
): Promise<void> => {
    switch (match) {
        case Attr.INODE: // Identical inode only
        case Attr.INODE + Attr.NAME: // 3 - move
        case Attr.INODE + Attr.PATH: // 5 - name
        case Attr.NAME + Attr.PATH: // different inode only (e.g: remount disk)
            const deName: string = dbEl[dbElIdx[dbElIdx.length - 1]].record.file_name;
            const dePath: string = dbEl[dbElIdx[dbElIdx.length - 1]].record.file_path;
            await move(
                dePath === '.' ? deName : `${dePath}/${deName}`,
                fc.path === '.' ? fc.name : `${fc.path}/${fc.name}`,
                fc.ino,
                fc.type === 'directory' ? true : false,
                channel
            );
            break;
        case Attr.INODE + Attr.NAME + Attr.PATH: // 7 - ignore (totally identical)
            break;
        case 8: // hash changed
            await update(
                fc.path === '.' ? fc.name : `${fc.path}/${fc.name}`,
                fc.ino,
                false, // isDirectory,
                channel,
                fc.hash
            );
            break;
        default:
            // 0 or Attr.PATH - create
            await create(
                fc.path === '.' ? fc.name : `${fc.path}/${fc.name}`,
                fc.ino,
                fc.type === 'directory' ? true : false,
                channel,
                fc.hash
            );
            break;
    }
};

const _process = async (
    fsEl: FilesystemContent,
    dbEl: FullTreeContent,
    level: number,
    channel: amqp.Channel
): Promise<void> => {
    try {
        if (!fsEl.filter(fse => fse.level === level).length) {
            // delete all untreated elements in database before end of process
            // console.log('Before DEL fsEl:', fsEl);
            await _delUntrtDbEl(dbEl, channel);
            return;
        }

        let match: Attr;
        let dbElIdx: number[];
        for (const fc of fsEl) {
            if (fc.level === level && !fc.trt) {
                ({match, dbElIdx} = await _getEventTypeAndDbElIdx(fc, dbEl));
                await _trtFile(match, dbElIdx, dbEl, fc, channel);
                fc.trt = true;
            }
        }

        await _process(fsEl, dbEl, level + 1, channel);
    } catch (e) {
        throw e;
    }
};

export default async (fsScan: FilesystemContent, dbScan: FullTreeContent, channel: amqp.Channel): Promise<void> => {
    try {
        let dbEl: FullTreeContent;
        dbEl = _extractChildrenDbElems(dbScan, dbEl);
        await _process(fsScan, dbEl, 0, channel);
    } catch (e) {
        throw e;
    }
};
