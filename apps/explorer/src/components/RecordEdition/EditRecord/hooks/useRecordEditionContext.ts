// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, useContext} from 'react';
import {IRecordEditionContext} from '../_types';

export const RecordEditionContext = createContext<IRecordEditionContext>({elements: {}, readOnly: false, record: null});

export const useRecordEditionContext = () => useContext(RecordEditionContext);
