// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {ReactNode} from 'react';
import {StateNavigationContext} from '../../Context/StateNavigationContext';
import {INavigationReducerState, NavigationReducerInitialState} from '../../Reducer/NavigationReducer';
import {IMockNavigationReducerState} from './MockNavigationReducer';

interface IMockStateNavigation {
    children: ReactNode;
    stateNavigation?: IMockNavigationReducerState;
    dispatchNavigation?: any;
}

export const MockStateNavigation = ({children, stateNavigation, dispatchNavigation}: IMockStateNavigation) => {
    let stateNavigationValue: INavigationReducerState = NavigationReducerInitialState;
    let dispatchNavigationValue = jest.fn();

    if (stateNavigation) {
        stateNavigationValue = {...stateNavigationValue, ...stateNavigation};
    }
    if (dispatchNavigation) {
        dispatchNavigationValue = dispatchNavigation;
    }

    return (
        <StateNavigationContext.Provider
            value={{stateNavigation: stateNavigationValue, dispatchNavigation: dispatchNavigationValue}}
        >
            {children}
        </StateNavigationContext.Provider>
    );
};
