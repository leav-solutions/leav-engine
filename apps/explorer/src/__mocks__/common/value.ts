// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordPropertyWithAttribute} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {mockFormAttribute} from './attribute';
import {mockPreviews} from './record';

export const mockModifier: RecordIdentity = {
    id: '1',
    whoAmI: {
        id: '123456',
        label: 'admin',
        library: {
            id: 'users',
            label: {fr: 'Utilisateurs'},
            gqlNames: {
                query: 'users',
                type: 'User'
            }
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
    value: 'my value',
    raw_value: 'my value',
    treeValue: null,
    linkValue: null
};

export const mockRecordPropertyWithAttribute: IRecordPropertyWithAttribute = {
    value: mockRecordProperty,
    attribute: mockFormAttribute
};
