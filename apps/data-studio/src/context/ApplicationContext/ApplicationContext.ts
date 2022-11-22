// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useContext} from 'react';
import {GET_APPLICATION_BY_ID_applications_list} from '_gqlTypes/GET_APPLICATION_BY_ID';

const ApplicationContext = React.createContext<GET_APPLICATION_BY_ID_applications_list>(null);

export const useApplicationContext = () => useContext(ApplicationContext);

export default ApplicationContext;
