import React, {type Dispatch, useContext} from 'react';
import {type FormBuilderAction, type IFormBuilderState} from '../formBuilderReducer';

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
}>({state: initialState, dispatch: () => initialState});

export const useFormBuilderReducer = () => useContext(FormBuilderReducerContext);
