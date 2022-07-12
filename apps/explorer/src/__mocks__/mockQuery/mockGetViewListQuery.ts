// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockView} from '__mocks__/common/view';
import {getViewsListQuery, IGetViewListElement} from '../../graphQL/queries/views/getViewsListQuery';

const views: IGetViewListElement[] = [
    {
        ...mockView,
        __typename: 'View',
        created_by: {
            id: '1',
            whoAmI: {
                id: '1',
                label: {
                    fr: 'name',
                    en: 'name'
                },
                library: {
                    id: 'users',
                    gqlNames: {
                        query: 'users',
                        type: 'Users'
                    }
                }
            }
        },
        filters: []
    }
];

const mocksGetViewsListQuery = (libraryId: string) => {
    const mocks = [
        {
            request: {
                query: getViewsListQuery(true),
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
