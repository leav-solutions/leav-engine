// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SortOrder, ViewTypes} from '_gqlTypes/globalTypes';
import {getViewsListQuery, IGetViewListElement} from '../../graphQL/queries/views/getViewsListQuery';

const views: IGetViewListElement[] = [
    {
        id: 'id',
        type: ViewTypes.list,
        shared: false,
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
        sort: {
            field: 'id',
            order: SortOrder.asc
        },
        settings: []
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
