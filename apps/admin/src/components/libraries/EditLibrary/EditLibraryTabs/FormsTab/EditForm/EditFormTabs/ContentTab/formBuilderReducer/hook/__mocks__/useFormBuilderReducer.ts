import React, {type Dispatch} from 'react';
import {type FormBuilderAction, type IFormBuilderState} from '../../formBuilderReducer';
import {mockInitialState} from '../../_fixtures/fixtures';

const initialState: IFormBuilderState = {
    form: null,
    library: '',
    openSettings: false,
    activeDependency: null,
    elementInSettings: null,
    elements: {},
    activeElements: {},
};

export const FormBuilderReducerContext = React.createContext<{
    state: IFormBuilderState;
    dispatch: Dispatch<FormBuilderAction>;
}>({state: mockInitialState, dispatch: () => vi.fn()});

export const useFormBuilderReducer = () => ({
    state: mockInitialState,
    dispatch: vi.fn(),
});
