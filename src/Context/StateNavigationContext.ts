import React, {createContext, useContext} from 'react';
import {
    INavigationReducerState,
    NavigationReducerAction,
    NavigationReducerInitialState
} from '../Reducer/NavigationReducer';

interface IStateNavigationContext {
    stateNavigation: INavigationReducerState;
    dispatchNavigation: React.Dispatch<NavigationReducerAction>;
}

export const StateNavigationContext = createContext<IStateNavigationContext>({
    stateNavigation: NavigationReducerInitialState,
    dispatchNavigation: null as any
});

export const useStateNavigation = () => useContext(StateNavigationContext);
