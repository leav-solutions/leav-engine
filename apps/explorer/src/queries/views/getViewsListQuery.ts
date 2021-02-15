// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {ConditionFilter, ILabel, OperatorFilter, OrderSearch, ViewType} from '../../_types/types';

export interface IGetViewListFilter {
    field: string;
    value: any;
    condition: ConditionFilter;
    operator: OperatorFilter;
}

export interface IGetViewListSort {
    field: string;
    order: OrderSearch;
}

export interface IGetViewListSettings {
    name: string;
    value: any;
}

export interface IGetViewListElement {
    id: string;
    type: ViewType;
    shared: boolean;
    created_by: {
        id: string;
        whoAmI: {
            id: string;
            label: ILabel;
            library: {
                id: string;
            };
        };
    };
    label: ILabel;
    description?: ILabel;
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
                type
                shared
                created_by {
                    id
                    whoAmI {
                        id
                        label
                        library {
                            id
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
