// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordField} from 'queries/trees/getTreeContentQuery';
import {INavigationPath} from '_types/types';
import {NavigationReducerAction, NavigationReducerActionsTypes} from './NavigationReducer';

export const setPath = (path: INavigationPath[]): NavigationReducerAction => ({
    type: NavigationReducerActionsTypes.SET_PATH,
    path
});

export const setIsLoading = (isLoading: boolean): NavigationReducerAction => {
    return {
        type: NavigationReducerActionsTypes.SET_IS_LOADING,
        isLoading
    };
};

export const setRecordDetail = (recordDetail: IRecordField): NavigationReducerAction => {
    return {
        type: NavigationReducerActionsTypes.SET_RECORD_DETAIL,
        recordDetail
    };
};

export const resetRecordDetail = (): NavigationReducerAction => {
    return {
        type: NavigationReducerActionsTypes.SET_RECORD_DETAIL
    };
};

export const setRefetchTreeData = (refetchTreeData: boolean): NavigationReducerAction => ({
    type: NavigationReducerActionsTypes.SET_REFETCH_TREE_DATA,
    refetchTreeData
});
