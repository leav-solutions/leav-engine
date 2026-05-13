import {type IGlobalSettings} from '../../_types/globalSettings';
import {DEFAULT_APPLICATION} from '../../_constants/globalSettings';

export const mockGlobalSettings: IGlobalSettings = {
    defaultApp: DEFAULT_APPLICATION,
    name: 'My app name',
    icon: {
        library: 'myLibraryId',
        recordId: '42',
    },
    favicon: {
        library: 'myLibraryId',
        recordId: '1337',
    },
};
