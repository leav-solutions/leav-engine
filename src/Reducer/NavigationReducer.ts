export enum NavigationReducerActionsTypes {
    SET_PATH = 'SET_PATH'
}

export interface NavigationReducerState {
    path: {id: string; library: string}[];
}

export const NavigationReducerInitialState: NavigationReducerState = {
    path: []
};

export type NavigationReducerAction = {
    type: NavigationReducerActionsTypes.SET_PATH;
    path: {id: string; library: string}[];
};

export const NavigationReducer = (state: NavigationReducerState, action: NavigationReducerAction) => {
    switch (action.type) {
        case NavigationReducerActionsTypes.SET_PATH:
            return {...state, path: action.path};
        default:
            return state;
    }
};

// Actions

export const setPath = (path: {id: string; library: string}[]) => {
    return {
        type: NavigationReducerActionsTypes.SET_PATH,
        path
    };
};
