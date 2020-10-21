import {INavigationPath} from '../_types/types';

export enum NavigationReducerActionsTypes {
    SET_PATH = 'SET_PATH',
    SET_IS_LOADING = 'SET_IS_LOADING'
}

export interface NavigationReducerState {
    path: INavigationPath[];
    isLoading: boolean;
}

export const NavigationReducerInitialState: NavigationReducerState = {
    path: [],
    isLoading: true
};

export type NavigationReducerAction =
    | {
          type: NavigationReducerActionsTypes.SET_PATH;
          path: INavigationPath[];
      }
    | {
          type: NavigationReducerActionsTypes.SET_IS_LOADING;
          isLoading: boolean;
      };

export const NavigationReducer = (state: NavigationReducerState, action: NavigationReducerAction) => {
    switch (action.type) {
        case NavigationReducerActionsTypes.SET_PATH:
            return {...state, path: action.path};
        case NavigationReducerActionsTypes.SET_IS_LOADING:
            return {...state, isLoading: action.isLoading};
        default:
            return state;
    }
};

// Actions

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
