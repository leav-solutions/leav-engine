// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {RecordFilterCondition, RecordFilterOperator, SortOrder, ViewTypes} from '_gqlTypes/globalTypes';
import {ISystemTranslation} from '../../../_types/types';

export interface IGetViewFilter {
    field?: string;
    value: any;
    condition: RecordFilterCondition;
    operator: RecordFilterOperator;
    treeId?: string;
}

export interface IGetViewSort {
    field: string;
    order: SortOrder;
}

export interface IGetViewSettings {
    name: string;
    value: any;
}

export interface IGetViewElement {
    __typename: string;
    id: string;
    type: ViewTypes;
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
    filters?: IGetViewFilter[] | null;
    sort?: IGetViewSort | null;
    settings?: IGetViewSettings[];
}

export interface IGetViewQuery {
    view: IGetViewElement;
}

export interface IGetViewVariables {
    viewId: string;
}

export const getViewByIdQuery = gql`
    query GET_VIEW($viewId: String!) {
        view(viewId: $viewId) {
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
`;
