// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IViewV2, type IViewV2CreateInput, ViewV2Sizes, ViewV2Types} from '../../_types/viewsV2';

export const mockViewV2CreateInput: IViewV2CreateInput = {
    library: 'test_lib',
    label: {fr: 'My view'},
    display: {type: ViewV2Types.LIST, size: ViewV2Sizes.MEDIUM},
    shared: true,
    description: {fr: 'My test view'},
    color: '#123456',
    filters: [{field: 'id', value: 'fake_id_filter'}],
    sort: [{field: 'id', order: 'asc'}],
    attributes: ['id', 'label'],
};

export const mockViewV2: IViewV2 = {
    ...mockViewV2CreateInput,
    id: 'test_view_v2',
    created_by: '1',
    created_at: 1234567890,
    modified_at: 1234567890,
    attributes: ['id', 'label'],
};
