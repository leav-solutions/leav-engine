import React, {ReactNode} from 'react';
import {StateNavigationContext} from '../../Context/StateNavigationContext';
import {NavigationReducerInitialState} from '../../Reducer/NavigationReducer';

interface IMockStateNavigation {
    children: ReactNode;
    dispatchNavigation?: any;
}

export const MockStateNavigation = ({children, dispatchNavigation}: IMockStateNavigation) => {
    let dispatchNavigationValue = jest.fn();

    if (dispatchNavigation) {
        dispatchNavigationValue = dispatchNavigation;
    }

    return (
        <StateNavigationContext.Provider
            value={{stateNavigation: NavigationReducerInitialState, dispatchNavigation: dispatchNavigationValue}}
        >
            {children}
        </StateNavigationContext.Provider>
    );
};
