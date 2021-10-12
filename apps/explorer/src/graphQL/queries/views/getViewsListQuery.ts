// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {RecordFilterCondition, RecordFilterOperator, SortOrder, ViewTypes, ViewSizes} from '_gqlTypes/globalTypes';
import {ISystemTranslation} from '../../../_types/types';

export interface IGetViewListFilter {
    field?: string;
    value: any;
    condition: RecordFilterCondition;
    operator: RecordFilterOperator;
    treeId?: string;
}

export interface IGetViewListSort {
    field: string;
    order: SortOrder;
}

export interface IGetViewListSettings {
    name: string;
    value: any;
}

export interface IGetViewListElement {
    __typename: string; // FIXME: ??
    id: string;
    display: {size: ViewSizes; type: ViewTypes};
    shared: boolean;
    created_by: {
        id: string;
        whoAmI: {
            id: string;
            label: ISystemTranslation;
            library: {
                id: string;
                gqlNames: {
                    query: string;
                    type: string;
                };
            };
        };
    };
    label: ISystemTranslation;
    description?: ISystemTranslation;
    color?: string;
    filters?: IGetViewListFilter[] | null;
    sort?: IGetViewListSort | null;
    settings?: IGetViewListSettings[];
}

export interface IGetViewListQuery {
    views: {totalCount: number; list: IGetViewListElement[]};
}

export interface IGetViewListVariables {
    libraryId: string;
}

export const getViewsListQuery = gql`
    query GET_VIEWS_LIST($libraryId: String!) {
        views(library: $libraryId) {
            totalCount
            list {
                id
                display {
                    size
                    type
                }
                shared
                created_by {
                    id
                    whoAmI {
                        id
                        label
                        library {
                            id
                            gqlNames {
                                query
                                type
                            }
                        }
                    }
                }
                label
                description
                color
                filters {
                    field
                    value
                    condition
                    operator
                }
                sort {
                    field
                    order
                }
                settings {
                    name
                    value
                }
            }
        }
    }
`;
