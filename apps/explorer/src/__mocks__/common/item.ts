// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IItem} from '_types/types';

export const itemMock: IItem = {
    fields: {},
    whoAmI: {
        id: 'id',
        label: 'label',
        color: null,
        preview: null,
        library: {
            id: 'library-id',
            label: {
                fr: 'library',
                en: 'library'
            },
            gqlNames: {
                type: 'LibraryId',
                query: 'library_id'
            }
        }
    },
    index: 0
};
