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
