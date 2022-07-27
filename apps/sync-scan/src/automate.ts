// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import * as events from './events';
import {FilesystemContent, IFileContent} from './_types/filesystem';
import {FullTreeContent, IDbLibrariesSettings, IDbScanResult, IRecord} from './_types/queries';

enum Attr {
    NOTHING = 0,
    INODE = 1,
    NAME = 2,
    PATH = 4
}

const HASH_DIFF = 8;

const _extractChildrenDbElements = (
    dbSettings: IDbLibrariesSettings,
    database: FullTreeContent,
    dbEl?: FullTreeContent
): FullTreeContent => {
    let toList: FullTreeContent = [];

    for (const e of database) {
        if (typeof e.record.treePath === 'undefined') {
            e.record.treePath = '.';
        }

        if (e.record.library === dbSettings.directoriesLibraryId && e.children.length) {
            e.children = e.children.map(c => ({
                ...c,
                record: {
                    ...c.record,
                    treePath:
                        e.record.treePath === '.' ? e.record.file_name : e.record.treePath + '/' + e.record.file_name
                }
            }));

            toList = toList.concat(e.children);
        }

        delete e.children;
    }

    dbEl = typeof dbEl !== 'undefined' ? dbEl.concat(database) : database;

    if (toList.length) {
        return _extractChildrenDbElements(dbSettings, toList, dbEl);
    }

    return dbEl;
};

const _getEventTypeAndDbElIdx = (fc: IFileContent, dbEl: FullTreeContent) => {
    let match: Attr | number = Attr.NOTHING;
    const dbElIdx = [];

    for (const [i, e] of dbEl.entries()) {
        if (typeof e.record.trt === 'undefined') {
            const res: number =
                (fc.ino === e.record.inode ? Attr.INODE : 0) +
                (fc.name === e.record.file_name ? Attr.NAME : 0) +
                (fc.path === e.record.treePath ? Attr.PATH : 0);

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
            match = HASH_DIFF;
        }
    }

    return {match, dbElIdx};
};

const _delUntreatedDbElements = async (
    dbEl: FullTreeContent,
    dbSettings: IDbLibrariesSettings,
    amqp: IAmqpService
): Promise<void> => {
    for (const de of dbEl.filter(e => typeof e.record.trt === 'undefined')) {
        await events.remove(
            de.record.treePath === '.' ? de.record.file_name : `${de.record.treePath}/${de.record.file_name}`,
            de.record.inode,
            de.record.library === dbSettings.directoriesLibraryId,
            de.record.id,
            amqp
        );
    }
};

const _treatFile = async (match: Attr | number, dbEl: IRecord, fc: IFileContent, amqp: IAmqpService): Promise<void> => {
    switch (match) {
        case Attr.INODE: // Identical inode only
        case Attr.INODE + Attr.NAME: // 3 - move
        case Attr.INODE + Attr.PATH: // 5 - rename
        case Attr.NAME + Attr.PATH: // different inode only (e.g: remount disk)
            await events.move(
                dbEl.record.treePath === '.'
                    ? dbEl.record.file_name
                    : `${dbEl.record.treePath}/${dbEl.record.file_name}`,
                fc.path === '.' ? fc.name : `${fc.path}/${fc.name}`,
                fc.ino,
                fc.type === 'directory' ? true : false,
                dbEl.record.id,
                amqp
            );
            break;
        case Attr.INODE + Attr.NAME + Attr.PATH: // 7 - ignore (totally identical)
            break;
        case HASH_DIFF: // hash changed
            await events.update(
                fc.path === '.' ? fc.name : `${fc.path}/${fc.name}`,
                fc.ino,
                false, // isDirectory,
                amqp,
                fc.hash,
                dbEl.record.id
            );
            break;
        default:
            // 0 or Attr.PATH - create
            await events.create(
                fc.path === '.' ? fc.name : `${fc.path}/${fc.name}`,
                fc.ino,
                fc.type === 'directory' ? true : false,
                amqp,
                fc.hash
            );
            break;
    }
};

const _process = async (
    fsElements: FilesystemContent,
    dbElements: FullTreeContent,
    level: number,
    dbSettings: IDbLibrariesSettings,
    amqp: IAmqpService
): Promise<void> => {
    if (!fsElements.filter(fse => fse.level === level).length) {
        // delete all untreated elements in database before end of process
        await _delUntreatedDbElements(dbElements, dbSettings, amqp);
        return;
    }

    let match: Attr;
    let dbElIdx: number[];
    for (const fc of fsElements) {
        if (fc.level === level && !fc.trt) {
            ({match, dbElIdx} = _getEventTypeAndDbElIdx(fc, dbElements));
            await _treatFile(match, dbElements[dbElIdx[dbElIdx.length - 1]], fc, amqp);
            fc.trt = true;
        }
    }

    await _process(fsElements, dbElements, level + 1, dbSettings, amqp);
};

export default async (fsScan: FilesystemContent, dbScan: IDbScanResult, amqp: IAmqpService): Promise<void> => {
    const dbSettings = {
        filesLibraryId: dbScan.filesLibraryId,
        directoriesLibraryId: dbScan.directoriesLibraryId
    };

    const dbElements = _extractChildrenDbElements(dbSettings, dbScan.treeContent);

    await _process(fsScan, dbElements, 0, dbSettings, amqp);
};
