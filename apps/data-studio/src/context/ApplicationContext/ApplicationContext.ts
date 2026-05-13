import React, {useContext} from 'react';
import {type IApplicationContext} from './_types';

const ApplicationContext = React.createContext<IApplicationContext>(null);

export const useApplicationContext = () => useContext(ApplicationContext);

export default ApplicationContext;
