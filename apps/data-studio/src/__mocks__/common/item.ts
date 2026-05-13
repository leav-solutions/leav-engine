import {LibraryBehavior} from '../../_gqlTypes';
import {type IItem} from '../../_types/types';

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
                en: 'library',
            },
        },
    },
    index: 0,
};
