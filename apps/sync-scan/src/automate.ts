// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {groupDbFilesByDatas, groupFsFilesByDatas, _logMem} from './utils';
import * as events from './events';
import {FilesystemContent, IFileContent, IFilesystemDatas} from './_types/filesystem';
import {FullTreeContent, IDbFilesDatas, IDbLibrariesSettings, IRecord} from './_types/queries';

enum EMatches {
    EXACT = 'exact',
    NAMEANDPATH = 'nameAndPath',
    INODEANDNAME = 'inodeAndName',
    INODEANDPATH = 'inodeAndPath',
    NOTFOUND = 'notFound',
    DELETE = 'delete'
}

export const _extractChildrenDbElements = (
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

const _removeAlreadyTreatedFromList = (f: IRecord) => f.record.trt === undefined;
const _setTreated = (f: IRecord) => (f.record.trt = true);

const _findDbFileForFsFile = (fsFile: IFileContent, dbFilesByData: IDbFilesDatas) => {
    const matchdbFilesByInode = dbFilesByData.filesByInode[fsFile.ino] || [];
    const matchdbFilesByName = dbFilesByData.filesByName[fsFile.name] || [];
    const matchdbFilesByPath = dbFilesByData.filesByPath[fsFile.path] || [];

    const matchesByNameAndPath = matchdbFilesByName
        .filter(x => matchdbFilesByPath.includes(x))
        .filter(_removeAlreadyTreatedFromList);
    const matchesByAll = matchesByNameAndPath
        .filter(x => matchdbFilesByInode.includes(x))
        .filter(_removeAlreadyTreatedFromList);

    if (matchesByAll.length) {
        _setTreated(matchesByAll[0]);
        return {match: EMatches.EXACT, dbFile: matchesByAll[0]};
    }

    if (matchesByNameAndPath.length) {
        _setTreated(matchesByNameAndPath[0]);
        return {match: EMatches.NAMEANDPATH, dbFile: matchesByNameAndPath[0]};
    }

    const matchesByInodeAndName = matchdbFilesByInode
        .filter(x => matchdbFilesByName.includes(x))
        .filter(_removeAlreadyTreatedFromList);
    if (matchesByInodeAndName.length) {
        _setTreated(matchesByInodeAndName[0]);
        return {match: EMatches.INODEANDNAME, dbFile: matchesByInodeAndName[0]};
    }

    const matchesByInodeAndPath = matchdbFilesByInode
        .filter(x => matchdbFilesByPath.includes(x))
        .filter(_removeAlreadyTreatedFromList);
    if (matchesByInodeAndPath.length) {
        _setTreated(matchesByInodeAndPath[0]);
        return {match: EMatches.INODEANDPATH, dbFile: matchesByInodeAndPath[0]};
    }

    return {match: EMatches.NOTFOUND, dbFile: null};
};

const _sendCommand = async (
    match: string,
    fsFile: IFileContent | null,
    dbFile: IRecord | null,
    amqp: IAmqpService,
    dbSettings: IDbLibrariesSettings
) => {
    switch (match) {
        case EMatches.EXACT:
            if (fsFile.hash !== dbFile.record.hash) {
                return events.update(
                    fsFile.path === '.' ? fsFile.name : `${fsFile.path}/${fsFile.name}`,
                    fsFile.ino,
                    false, // isDirectory parameter, in this case it is sure we are not on a directory
                    amqp,
                    fsFile.hash,
                    dbFile.record.id
                );
            }
            // otherwise we do nothing cause fsFile and dbFile are "in sync"
            break;
        case EMatches.NAMEANDPATH:
            return events.update(
                fsFile.path === '.' ? fsFile.name : `${fsFile.path}/${fsFile.name}`,
                fsFile.ino,
                fsFile.type === 'directory' ? true : false,
                amqp,
                fsFile.hash,
                dbFile.record.id
            );
            break;
        case EMatches.INODEANDPATH:
        case EMatches.INODEANDNAME:
            return events.move(
                dbFile.record.treePath === '.'
                    ? dbFile.record.file_name
                    : `${dbFile.record.treePath}/${dbFile.record.file_name}`,
                fsFile.path === '.' ? fsFile.name : `${fsFile.path}/${fsFile.name}`,
                fsFile.ino,
                fsFile.type === 'directory' ? true : false,
                dbFile.record.id,
                amqp
            );
            break;
        case EMatches.NOTFOUND:
            return events.create(
                fsFile.path === '.' ? fsFile.name : `${fsFile.path}/${fsFile.name}`,
                fsFile.ino,
                fsFile.type === 'directory' ? true : false,
                amqp,
                fsFile.hash
            );
            break;
        case EMatches.DELETE:
            return events.remove(
                dbFile.record.treePath === '.'
                    ? dbFile.record.file_name
                    : `${dbFile.record.treePath}/${dbFile.record.file_name}`,
                dbFile.record.inode,
                dbFile.record.library === dbSettings.directoriesLibraryId,
                dbFile.record.id,
                amqp
            );
            break;
        default:
            return null;
            break;
    }
    return null;
};
const _process = async (
    fsFiles: FilesystemContent,
    dbFiles: IRecord[],
    fsFilesByData: IFilesystemDatas,
    dbFilesByData: IDbFilesDatas,
    dbSettings: IDbLibrariesSettings,
    amqp: IAmqpService
): Promise<void> => {
    const fsLevels = Object.keys(fsFilesByData.filesByLevel);
    fsLevels.sort();
    // we process elements from least nested to most nested = we process folder before its children
    for (const level of fsLevels) {
        //fsLevels.forEach(async(level) => {
        for (const fsFile of fsFilesByData.filesByLevel[level]) {
            //fsFilesByData.filesByLevel[level].forEach(async(fsFile) => {
            const {match, dbFile} = _findDbFileForFsFile(fsFile, dbFilesByData);
            await _sendCommand(match, fsFile, dbFile, amqp, dbSettings);
            //});
        }
        //});
    }

    const dbFilesToRemove = dbFiles.filter(_removeAlreadyTreatedFromList);

    for (const dbFile of dbFilesToRemove) {
        //dbFilesToRemove.forEach(async(dbFile) => {
        await _sendCommand('delete', null, dbFile, amqp, dbSettings);
        //});
    }
};

export default async (
    fsFiles: FilesystemContent,
    dbFiles: IRecord[],
    dbSettings: IDbLibrariesSettings,
    amqp: IAmqpService
): Promise<void> => {
    const fsFilesByData = groupFsFilesByDatas(fsFiles);
    const dbFilesByData = groupDbFilesByDatas(dbFiles);

    await _process(fsFiles, dbFiles, fsFilesByData, dbFilesByData, dbSettings, amqp);
};
