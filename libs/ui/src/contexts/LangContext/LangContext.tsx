// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {ILangContext} from './_types';

const LangContext = React.createContext<ILangContext | null>(null);

export default LangContext;
