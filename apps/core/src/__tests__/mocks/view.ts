// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ViewTypes, ViewSizes} from '../../_types/views';

export const mockViewBeforeCreation: IView = {
    library: 'test_lib',
    label: {fr: 'My view'},
    description: {fr: 'My test view'},
    color: '#123456',
    display: {type: ViewTypes.LIST, size: ViewSizes.MEDIUM},
    filters: [
        {
            field: 'id',
            value: 'fake_id_filter'
        }
    ],
    sort: {
        field: 'id',
        order: 'asc'
    },
    shared: true,
    settings: {
        columns: ['id', 'label']
    }
};

export const mockView: MandatoryId<IView> = {
    ...mockViewBeforeCreation,
    id: 'test_view',
    created_by: '1',
    created_at: 1234567890,
    modified_at: 1234567890
};
