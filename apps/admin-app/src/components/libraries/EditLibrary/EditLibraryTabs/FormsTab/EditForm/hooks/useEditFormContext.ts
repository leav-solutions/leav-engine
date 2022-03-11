// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, useContext} from 'react';
import {GET_FORM_forms_list} from '_gqlTypes/GET_FORM';

export interface IEditFormContext {
    form: GET_FORM_forms_list;
    library: string;
    readonly: boolean;
    setForm: (form: GET_FORM_forms_list) => void;
}

export const EditFormContext = createContext<IEditFormContext>({
    form: null,
    library: null,
    readonly: false,
    setForm: null
});

export const useEditFormContext = () => useContext(EditFormContext);
