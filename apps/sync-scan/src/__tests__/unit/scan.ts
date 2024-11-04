// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {FilesystemContent} from '_types/filesystem';
import {IDbScanResult} from '_types/queries';
export const mockDbSettings = {
    filesLibraryId: 'files',
    directoriesLibraryId: 'directories'
};

export const mockDbResult: IDbScanResult = {
    filesLibraryId: 'files',
    directoriesLibraryId: 'directories',
    treeContent: [
        {
            order: 0,
            record: {
                id: '293900',
                active: true,
                created_at: 1585753474,
                created_by: 1,
                file_name: 'dir',
                file_path: '.',
                inode: 573198,
                modified_at: 1585753474,
                modified_by: 1,
                previews_status: {
                    small: {
                        status: -1,
                        message: 'wait for creation'
                    },
                    medium: {
                        status: -1,
                        message: 'wait for creation'
                    },
                    big: {
                        status: -1,
                        message: 'wait for creation'
                    },
                    pdf: {
                        status: -1,
                        message: 'wait for creation'
                    }
                },
                previews: {
                    small: '',
                    medium: '',
                    big: '',
                    pdf: ''
                },
                root_key: 'files1',
                library: 'files'
            },
            children: []
        }
    ]
};

export const mockFsContent: FilesystemContent = [
    {
        dev: 16777220,
        mode: 16877,
        nlink: 3,
        uid: 501,
        gid: 20,
        rdev: 0,
        blksize: 4096,
        ino: 2103706,
        size: 96,
        blocks: 0,
        atimeMs: 1594901938746.951,
        mtimeMs: 1594901938747.075,
        ctimeMs: 1594901938747.075,
        birthtimeMs: 1594901938746.951,
        atime: new Date('2020-07-16T12:18:58.747Z'),
        mtime: new Date('2020-07-16T12:18:58.747Z'),
        ctime: new Date('2020-07-16T12:18:58.747Z'),
        birthtime: new Date('2020-07-16T12:18:58.747Z'),
        name: 'dir',
        type: 'directory',
        path: '.',
        level: 0,
        trt: false
    },
    {
        dev: 16777220,
        mode: 33188,
        nlink: 1,
        uid: 501,
        gid: 20,
        rdev: 0,
        blksize: 4096,
        ino: 2103707,
        size: 0,
        blocks: 0,
        atimeMs: 1594901938747.0667,
        mtimeMs: 1594901938747.0667,
        ctimeMs: 1594901938747.0667,
        birthtimeMs: 1594901938747.0667,
        atime: new Date('2020-07-16T12:18:58.747Z'),
        mtime: new Date('2020-07-16T12:18:58.747Z'),
        ctime: new Date('2020-07-16T12:18:58.747Z'),
        birthtime: new Date('2020-07-16T12:18:58.747Z'),
        name: 'file',
        type: 'file',
        hash: 'd41d8cd98f00b204e9800998ecf8427e',
        path: 'dir',
        level: 1,
        trt: false
    }
];
