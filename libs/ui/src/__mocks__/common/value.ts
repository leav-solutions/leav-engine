import {type IRecordPropertyWithAttribute} from '../../components/RecordEdition/editRecordReducer/editRecordReducer';
import {type IRecordPropertyModifier, RecordProperty} from '../../_queries/records/getRecordPropertiesQuery';
import {mockAttributeSimple} from './attribute';
import {mockPreviews} from './record';

export const mockModifier: IRecordPropertyModifier = {
    id: '1',
    whoAmI: {
        id: '123456',
        label: 'admin',
        subLabel: 'admin',
        library: {
            id: 'users',
            label: {fr: 'Utilisateurs'},
        },
        preview: mockPreviews,
        color: '#123456',
    },
};

export const mockRecordPropertyWithAttribute: IRecordPropertyWithAttribute = {
    attribute: {
        ...mockAttributeSimple,
        description: {
            fr: 'Ma description',
            en: 'My description',
        },
        multiple_values: false,
        readonly: false,
        required: false,
        permissions: {access_attribute: true, edit_value: true},
        compute: false,
    },
};
