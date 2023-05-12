// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {Dispatch} from 'react';
import {FormBuilderAction, IFormBuilderState} from '../../formBuilderReducer';
import {mockInitialState} from '../../_fixtures/fixtures';

const initialState: IFormBuilderState = {
    form: null,
    library: '',
    openSettings: false,
    activeDependency: null,
    elementInSettings: null,
    elements: {},
    activeElements: {}
};

export const FormBuilderReducerContext = React.createContext<{
    state: IFormBuilderState;
    dispatch: Dispatch<FormBuilderAction>;
}>({state: mockInitialState, dispatch: () => jest.fn()});

export const useFormBuilderReducer = () => ({
    state: mockInitialState,
    dispatch: jest.fn()
});
