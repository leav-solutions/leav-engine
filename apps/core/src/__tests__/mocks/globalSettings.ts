// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGlobalSettings} from '_types/globalSettings';

export const mockGlobalSettings: IGlobalSettings = {
    name: 'My app name',
    icon: {
        library: 'myLibraryId',
        recordId: '42'
    },
    favicon: {
        library: 'myLibraryId',
        recordId: '1337'
    }
};
