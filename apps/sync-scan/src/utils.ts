// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as crypto from 'node:crypto';
import fs from 'fs';
import {type FilesystemContent, type IFilesystemDatas} from './_types/filesystem';
import {type IDbFilesDatas, type IRecord} from './_types/queries';
import {logger} from '@leav/logger';

export const createHashFromFile = (filePath: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        fs.createReadStream(filePath)
            .on('data', data => hash.update(data))
            .on('end', () => resolve(hash.digest('hex')))
            .on('error', err => reject(err));
    });

// eslint-disable-next-line @typescript-eslint/naming-convention
export const _logMem = text => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    logger.info(`${text} ${Math.round(used * 100) / 100} MB`);
};

export const groupFsFilesByDatas = (fsScan: FilesystemContent): IFilesystemDatas =>
    fsScan.reduce(
        (acc, f) => {
            const inode = f.ino;
            const name = f.name;
            const path = f.path;
            const level = f.level;
            if (!acc.filesByInode[inode]) {
                acc.filesByInode[inode] = [];
            }
            acc.filesByInode[inode].push(f);

            if (!acc.filesByName[name]) {
                acc.filesByName[name] = [];
            }
            acc.filesByName[name].push(f);

            if (!acc.filesByPath[path]) {
                acc.filesByPath[path] = [];
            }
            acc.filesByPath[path].push(f);

            if (!acc.filesByLevel[level]) {
                acc.filesByLevel[level] = [];
            }
            acc.filesByLevel[level].push(f);
            return acc;
        },
        {
            filesByInode: {},
            filesByName: {},
            filesByPath: {},
            filesByLevel: {},
        },
    );
export const groupDbFilesByDatas = (dbScan: IRecord[]): IDbFilesDatas =>
    dbScan.reduce(
        (acc, f) => {
            const inode = f.record.inode;
            const name = f.record.file_name;
            const path = f.record.file_path;
            const hash = f.record.hash;
            if (!acc.filesByInode[inode]) {
                acc.filesByInode[inode] = [];
            }
            acc.filesByInode[inode].push(f);

            if (!acc.filesByName[name]) {
                acc.filesByName[name] = [];
            }
            acc.filesByName[name].push(f);

            if (!acc.filesByPath[path]) {
                acc.filesByPath[path] = [];
            }
            acc.filesByPath[path].push(f);

            if (!acc.filesByHash[hash]) {
                acc.filesByHash[hash] = [];
            }
            acc.filesByHash[hash].push(f);

            return acc;
        },
        {
            filesByInode: {},
            filesByName: {},
            filesByPath: {},
            filesByHash: {},
        },
    );
