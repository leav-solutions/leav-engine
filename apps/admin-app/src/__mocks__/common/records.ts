// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';

export const mockRecord: RecordIdentity_whoAmI = {
    id: 'record-id',
    library: {
        id: 'library-id',
        label: {
            fr: 'Librairie',
            en: 'Library'
        }
    },
    label: 'My record',
    color: '#123456',
    preview: {
        small: 'path/to/preview.png',
        medium: 'path/to/preview.png',
        pages: 'path/to/preview.png',
        big: 'path/to/preview.png'
    }
};
