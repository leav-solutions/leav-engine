// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {IItem} from '_types/types';

export const itemMock: IItem = {
    fields: {},
    whoAmI: {
        id: 'id',
        label: 'label',
        subLabel: null,
        color: null,
        preview: null,
        library: {
            id: 'library-id',
            behavior: LibraryBehavior.standard,
            label: {
                fr: 'library',
                en: 'library'
            }
        }
    },
    index: 0
};
