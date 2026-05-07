// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ViewV2Types, ViewV2Sizes, type IViewV2} from '../../_types/viewsV2';

export const mockViewV2BeforeCreation: IViewV2 = {
    library: 'test_lib',
    label: {fr: 'My view'},
    description: {fr: 'My test view'},
    color: '#123456',
    display: {type: ViewV2Types.LIST, size: ViewV2Sizes.MEDIUM},
    filters: [
        {
            field: 'id',
            value: 'fake_id_filter',
        },
    ],
    sort: [
        {
            field: 'id',
            order: 'asc',
        },
    ],
    shared: true,
    attributes: ['id', 'label'],
};

export const mockViewV2: MandatoryId<IViewV2> = {
    ...mockViewV2BeforeCreation,
    id: 'test_view_v2',
    created_by: '1',
    created_at: 1234567890,
    modified_at: 1234567890,
};
