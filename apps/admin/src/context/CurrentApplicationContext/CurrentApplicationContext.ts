// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {useContext} from 'react';
import {ICurrentApplicationContext} from './_types';

const CurrentApplicationContext = React.createContext<ICurrentApplicationContext>(null);

export const useCurrentApplicationContext = () => useContext(CurrentApplicationContext);

export default CurrentApplicationContext;
