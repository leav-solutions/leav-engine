import React, {useReducer} from 'react';
import {StateNavigationContext} from '../../Context/StateNavigationContext';
import {NavigationReducer, NavigationReducerInitialState} from '../../Reducer/NavigationReducer';
import NavigationView from '../NavigationView';

function Navigation(): JSX.Element {
    const [state, dispatch] = useReducer(NavigationReducer, NavigationReducerInitialState);

    return (
        <StateNavigationContext.Provider value={{stateNavigation: state, dispatchNavigation: dispatch}}>
            <NavigationView />
        </StateNavigationContext.Provider>
    );
}

export default Navigation;
