// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Override} from '@leav/utils';
import {ILibrary, LibraryBehavior} from '../../../../_types/library';

export type MigrationLibraryToCreate = Override<
    ILibrary,
    {
        attributes: string[];
        fullTextAttributes: string[];
    }
> & {_key: string};

const commonLibraryData: Partial<MigrationLibraryToCreate> = {
    system: true,
    recordIdentityConf: {
        label: 'label'
    },
    behavior: LibraryBehavior.STANDARD,
    attributes: ['id', 'created_by', 'created_at', 'modified_by', 'modified_at', 'active', 'label']
};
export const systemLibraries: MigrationLibraryToCreate[] = [
    {
        ...commonLibraryData,
        _key: 'users',
        label: {fr: 'Utilisateurs', en: 'Users'},
        fullTextAttributes: ['login', 'email', 'label'],
        recordIdentityConf: {
            label: 'login'
        },
        attributes: [...commonLibraryData.attributes, 'login', 'email', 'password', 'user_groups']
    },
    {
        ...(commonLibraryData as MigrationLibraryToCreate),
        _key: 'users_groups',
        fullTextAttributes: ['label'],
        label: {fr: "Groupes d'utilisateurs", en: 'Users groups'}
    },
    {
        ...(commonLibraryData as MigrationLibraryToCreate),
        _key: 'files',
        behavior: LibraryBehavior.FILES,
        label: {fr: 'Fichiers', en: 'Files'},
        recordIdentityConf: {
            label: 'file_name'
        },
        fullTextAttributes: ['file_name'],
        attributes: [
            ...commonLibraryData.attributes,
            'root_key',
            'hash',
            'file_path',
            'file_name',
            'inode',
            'previews',
            'previews_status'
        ]
    },
    {
        ...(commonLibraryData as MigrationLibraryToCreate),
        _key: 'files_directories',
        behavior: LibraryBehavior.DIRECTORIES,
        label: {fr: 'Dossiers', en: 'Directories'},
        recordIdentityConf: {
            label: 'file_name'
        },
        fullTextAttributes: ['file_name'],
        attributes: [
            ...commonLibraryData.attributes,
            'root_key',
            'hash',
            'file_path',
            'file_name',
            'inode',
            'previews',
            'previews_status'
        ]
    }
];
