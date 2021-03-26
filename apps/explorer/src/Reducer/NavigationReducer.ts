// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordField} from '../graphQL/queries/trees/getTreeContentQuery';
import {INavigationPath} from '../_types/types';

export enum NavigationReducerActionsTypes {
    SET_PATH = 'SET_PATH',
    SET_IS_LOADING = 'SET_IS_LOADING',
    SET_RECORD_DETAIL = 'SET_RECORD_DETAIL',
    SET_REFETCH_TREE_DATA = 'SET_REFETCH_TREE_DATA'
}

export interface INavigationReducerState {
    path: INavigationPath[];
    isLoading: boolean;
    recordDetail?: IRecordField;
    refetchTreeData: boolean;
}

export const NavigationReducerInitialState: INavigationReducerState = {
    path: [],
    isLoading: true,
    refetchTreeData: false
};

export type NavigationReducerAction =
    | {
          type: NavigationReducerActionsTypes.SET_PATH;
          path: INavigationPath[];
      }
    | {
          type: NavigationReducerActionsTypes.SET_IS_LOADING;
          isLoading: boolean;
      }
    | {
          type: NavigationReducerActionsTypes.SET_RECORD_DETAIL;
          recordDetail?: IRecordField;
      }
    | {
          type: NavigationReducerActionsTypes.SET_REFETCH_TREE_DATA;
          refetchTreeData: boolean;
      };

export const NavigationReducer = (state: INavigationReducerState, action: NavigationReducerAction) => {
    switch (action.type) {
        case NavigationReducerActionsTypes.SET_PATH:
            return {...state, path: action.path, recordDetail: undefined};
        case NavigationReducerActionsTypes.SET_IS_LOADING:
            return {...state, isLoading: action.isLoading};
        case NavigationReducerActionsTypes.SET_RECORD_DETAIL:
            return {...state, recordDetail: action.recordDetail};
        case NavigationReducerActionsTypes.SET_REFETCH_TREE_DATA:
            return {...state, refetchTreeData: action.refetchTreeData};
        default:
            return state;
    }
};
