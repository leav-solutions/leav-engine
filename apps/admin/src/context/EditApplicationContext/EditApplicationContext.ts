import React, {useContext} from 'react';
import {type GET_APPLICATION_BY_ID_applications_list} from '../../_gqlTypes/GET_APPLICATION_BY_ID';

export interface IEditApplicationContextData {
    application: GET_APPLICATION_BY_ID_applications_list;
    readonly: boolean;
}

const EditApplicationContext = React.createContext<IEditApplicationContextData>(null);

export const useEditApplicationContext = () => useContext(EditApplicationContext);

export default EditApplicationContext;
