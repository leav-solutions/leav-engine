// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGlobalSettings} from '_types/globalSettings';
import {DEFAULT_APPLICATION} from '../../_constants/globalSettings';

export const mockGlobalSettings: IGlobalSettings = {
    defaultApp: DEFAULT_APPLICATION,
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
