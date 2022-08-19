// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FullTreeContent, IDbScanResult, IRecord} from '../../../_types/queries';

export default (inodes: number[]): IDbScanResult => {
    database.forEach((e: IRecord, i: number) => (e.record.inode = inodes[i]));
    return {filesLibraryId: 'files', directoriesLibraryId: 'files_directories', treeContent: database};
};

const database: FullTreeContent = [
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
                pages: {
                    status: -1,
                    message: 'wait for creation'
                }
            },
            previews: {
                small: '',
                medium: '',
                big: '',
                pages: ''
            },
            root_key: 'files1',
            library: 'files_directories'
        },
        children: []
    },
    {
        order: 0,
        record: {
            id: '294045',
            active: true,
            created_at: 1585753474,
            created_by: 1,
            file_name: 'sdir',
            file_path: 'dir',
            inode: 573202,
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
                pages: {
                    status: -1,
                    message: 'wait for creation'
                }
            },
            previews: {
                small: '',
                medium: '',
                big: '',
                pages: ''
            },
            root_key: 'files1',
            library: 'files_directories'
        },
        children: []
    },
    {
        order: 0,
        record: {
            id: '293831',
            active: true,
            created_at: 1585753474,
            created_by: 1,
            file_name: 'f',
            file_path: 'dir',
            inode: 573226,
            hash: 'd41d8cd98f00b204e9800998ecf8427e',
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
                pages: {
                    status: -1,
                    message: 'wait for creation'
                }
            },
            previews: {
                small: '',
                medium: '',
                big: '',
                pages: ''
            },
            root_key: 'files1',
            library: 'files'
        },
        children: []
    },
    {
        order: 0,
        record: {
            id: '293969',
            active: true,
            created_at: 1585753474,
            created_by: 1,
            file_name: 'sf',
            file_path: 'dir',
            inode: 573805,
            hash: 'd41d8cd98f00b204e9800998ecf8427e',
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
                pages: {
                    status: -1,
                    message: 'wait for creation'
                }
            },
            previews: {
                small: '',
                medium: '',
                big: '',
                pages: ''
            },
            root_key: 'files1',
            library: 'files'
        },
        children: []
    },
    {
        order: 0,
        record: {
            id: '294121',
            active: true,
            created_at: 1585753474,
            created_by: 1,
            file_name: 'ssfile',
            file_path: 'dir/sdir',
            inode: 573990,
            hash: 'd41d8cd98f00b204e9800998ecf8427e',
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
                pages: {
                    status: -1,
                    message: 'wait for creation'
                }
            },
            previews: {
                small: '',
                medium: '',
                big: '',
                pages: ''
            },
            root_key: 'files1',
            library: 'files'
        },
        children: []
    }
];
