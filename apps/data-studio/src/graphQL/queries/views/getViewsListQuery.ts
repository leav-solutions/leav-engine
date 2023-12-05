// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {RecordFilterCondition, RecordFilterOperator, SortOrder, ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {ISystemTranslation} from '../../../_types/types';
import viewDetailsFragment from './viewDetailsFragment';

export interface IGetViewListFilter {
    field?: string;
    value: any;
    condition: RecordFilterCondition;
    operator: RecordFilterOperator;
    tree?: string;
}

export interface IGetViewListSort {
    field: string;
    order: SortOrder;
}

export interface IGetViewListSettings {
    name: string;
    value: any;
}

export interface IGetViewListDisplay {
    size: ViewSizes;
    type: ViewTypes;
}

export interface IGetViewListElement {
    __typename: string; // FIXME: ??
    id: string;
    display: IGetViewListDisplay;
    shared: boolean;
    created_by: {
        id: string;
        whoAmI: {
            id: string;
            label: ISystemTranslation;
            library: {
                id: string;
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
    ${viewDetailsFragment}
    query GET_VIEWS_LIST($libraryId: String!) {
        views(library: $libraryId) {
            totalCount
            list {
                ...ViewDetails
            }
        }
    }
`;
