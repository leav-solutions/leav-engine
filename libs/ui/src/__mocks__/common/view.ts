// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {IView} from '_ui/types/views';
import {SortOrder, ViewSizes, ViewTypes} from '_ui/_gqlTypes';

export const mockView: IView = {
    id: 'id',
    display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
    shared: false,
    owner: true,
    label: {
        fr: 'list',
        en: 'list'
    },
    description: {
        fr: 'this is a list ',
        en: 'this is a list '
    },
    color: '#e48232',
    filters: [],
    sort: [
        {
            field: 'id',
            order: SortOrder.asc
        }
    ],
    attributes: []
};
