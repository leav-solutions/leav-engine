import React, {type Dispatch} from 'react';
import {type FormBuilderAction, type IFormBuilderState} from '../../formBuilderReducer';
import {mockInitialState} from '../../_fixtures/fixtures';

export const FormBuilderReducerContext = React.createContext<{
    state: IFormBuilderState;
    dispatch: Dispatch<FormBuilderAction>;
}>({state: mockInitialState, dispatch: () => vi.fn()});

export const useFormBuilderReducer = () => ({
    state: mockInitialState,
    dispatch: vi.fn(),
});
