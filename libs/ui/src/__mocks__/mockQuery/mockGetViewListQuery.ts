// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {WithTypename} from '@leav/utils';
import {ViewDetailsFragment} from '_ui/_gqlTypes';
import {getViewsListQuery} from '_ui/_queries/views/getViewsListQuery';
import {mockView} from '../common/view';

const views: Array<WithTypename<ViewDetailsFragment>> = [
    {
        ...mockView,
        __typename: 'View',
        created_by: {
            id: '1',
            whoAmI: {
                id: '1',
                label: 'name',
                library: {
                    id: 'users'
                }
            }
        },
        filters: [],
        valuesVersions: null
    }
];

const mocksGetViewsListQuery = (libraryId: string) => {
    const mocks = [
        {
            request: {
                query: getViewsListQuery,
                variables: {
                    libraryId
                }
            },
            result: {
                data: {
                    views: {
                        totalCount: 1,
                        list: views
                    }
                }
            }
        }
    ];

    return mocks;
};

export default mocksGetViewsListQuery;
