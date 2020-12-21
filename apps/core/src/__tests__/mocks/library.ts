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
    id: 'test_lib_files',
    system: false,
    behavior: LibraryBehavior.FILES,
    label: {fr: 'Test lib'}
};
