// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useContext} from 'react';
import {ICurrentApplicationContext} from './_types';

const CurrentApplicationContext = React.createContext<ICurrentApplicationContext>(null);

export const useCurrentApplicationContext = () => useContext(CurrentApplicationContext);

export default CurrentApplicationContext;
