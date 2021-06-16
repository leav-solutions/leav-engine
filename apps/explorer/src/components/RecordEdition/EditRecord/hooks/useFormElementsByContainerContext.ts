// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, useContext} from 'react';
import {IFormElementsByContainer} from '../_types';

export const FormElementsByContainerContext = createContext<IFormElementsByContainer>({});

export const useFormElementsByContainerContext = () => useContext(FormElementsByContainerContext);
