// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export type FilesystemContent = IFileContent[];

export interface IFileContent {
    dev: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    blksize: number;
    ino: number;
    size: number;
    blocks: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
    birthtimeMs: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
    name: string;
    type: string;
    hash?: string;
    path?: string;
    level?: number;
    trt?: boolean;
}

interface IFilesByInode {
    [key: number]: IFileContent[];
}
interface IFilesByName {
    [key: string]: IFileContent[];
}
interface IFilesByPath {
    [key: string]: IFileContent[];
}
interface IFilesByLevel {
    [key: number]: IFileContent[];
}

export interface IFilesystemDatas {
    filesByInode: IFilesByInode;
    filesByName: IFilesByName;
    filesByPath: IFilesByPath;
    filesByLevel: IFilesByLevel;
}
