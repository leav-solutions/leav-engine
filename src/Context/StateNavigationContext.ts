import React, {createContext, useContext} from 'react';
import {
    NavigationReducerAction,
    NavigationReducerInitialState,
    NavigationReducerState
} from '../Reducer/NavigationReducer';

interface IStateNavigationContext {
    stateNavigation: NavigationReducerState;
    dispatchNavigation: React.Dispatch<NavigationReducerAction>;
}

export const StateNavigationContext = createContext<IStateNavigationContext>({
    stateNavigation: NavigationReducerInitialState,
    dispatchNavigation: null as any
});

export const useStateNavigation = () => useContext(StateNavigationContext);
