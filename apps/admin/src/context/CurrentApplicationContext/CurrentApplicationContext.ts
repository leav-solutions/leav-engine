import React, {useContext} from 'react';
import {type ICurrentApplicationContext} from './_types';

const CurrentApplicationContext = React.createContext<ICurrentApplicationContext>(null);

export const useCurrentApplicationContext = () => useContext(CurrentApplicationContext);

export default CurrentApplicationContext;
