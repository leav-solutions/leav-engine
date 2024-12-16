// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordPropertyWithAttribute} from '../../components/RecordEdition/editRecordReducer/editRecordReducer';
import {IRecordPropertyModifier, RecordProperty} from '../../_queries/records/getRecordPropertiesQuery';
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
            label: {fr: 'Utilisateurs'}
        },
        preview: mockPreviews,
        color: '#123456'
    }
};

export const mockRecordProperty: RecordProperty = {
    id_value: '123456',
    created_at: 1234567890,
    created_by: mockModifier,
    modified_at: 1234567890,
    modified_by: mockModifier,
    payload: 'my payload',
    raw_payload: 'my payload',
    treeValue: null,
    linkValue: null
};

export const mockRecordPropertyWithAttribute: IRecordPropertyWithAttribute = {
    value: mockRecordProperty,
    attribute: {
        ...mockAttributeSimple,
        description: {
            fr: 'Ma description',
            en: 'My description'
        },
        multiple_values: false,
        readonly: false,
        permissions: {access_attribute: true, edit_value: true},
        compute: false
    }
};
