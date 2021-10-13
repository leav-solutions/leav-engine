// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {IGetViewListElement, IGetViewListSort} from 'graphQL/queries/views/getViewsListQuery';
import {RecordFilterCondition, RecordFilterOperator, ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {ISystemTranslation} from '../../../_types/types';

export interface IAddViewMutation {
    saveView: IGetViewListElement;
}

export interface IAddViewMutationVariablesFilter {
    field?: string;
    value?: string;
    condition?: RecordFilterCondition;
    operator?: RecordFilterOperator;
    treeId?: string;
}

export interface IAddViewMutationVariablesSetting {
    name: string;
    value: any;
}

export interface IAddViewMutationVariablesView {
    id?: string;
    library: string;
    label: ISystemTranslation;
    display: {size: ViewSizes; type: ViewTypes};
    shared: boolean;
    description?: ISystemTranslation;
    color?: string;
    filters?: IAddViewMutationVariablesFilter[];
    sort?: IGetViewListSort;
    settings?: IAddViewMutationVariablesSetting[];
}

export interface IAddViewMutationVariables {
    view: IAddViewMutationVariablesView;
}

const addViewMutation = gql`
    mutation ADD_VIEW($view: ViewInput!) {
        saveView(view: $view) {
            id
        }
    }
`;

export default addViewMutation;
