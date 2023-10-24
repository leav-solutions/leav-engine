// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILibrary} from '_types/library';
import {LibraryBehavior} from '../../_types/library';

export const mockLibrary: ILibrary = {
    id: 'test_lib',
    system: false,
    behavior: LibraryBehavior.STANDARD,
    label: {fr: 'Test lib'}
};

export const mockLibraryFiles: ILibrary = {
    id: 'files',
    system: false,
    behavior: LibraryBehavior.FILES,
    label: {fr: 'Test lib'},
    previewsSettings: [
        {
            id: 'test',
            label: {fr: 'test'},
            description: {fr: 'test'},
            system: false,
            versions: {
                background: '#123456',
                density: 42,
                sizes: [
                    {
                        name: 'my_size',
                        size: 1337
                    }
                ]
            }
        },
        {
            id: 'test2',
            label: {fr: 'test 2'},
            description: {fr: 'test 2'},
            system: false,
            versions: {
                background: '#123456',
                density: 42,
                sizes: [
                    {
                        name: 'my_other_size',
                        size: 1337
                    }
                ]
            }
        }
    ]
};

export const mockLibraryDirectories: ILibrary = {
    id: 'files_directories',
    system: false,
    behavior: LibraryBehavior.DIRECTORIES,
    label: {fr: 'Test lib'}
};
