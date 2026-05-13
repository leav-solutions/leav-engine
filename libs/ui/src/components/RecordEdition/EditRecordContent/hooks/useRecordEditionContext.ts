import {createContext, useContext} from 'react';
import {type IRecordEditionContext} from '../_types';

export const RecordEditionContext = createContext<IRecordEditionContext>({elements: {}, readOnly: false, record: null});

export const useRecordEditionContext = () => useContext(RecordEditionContext);
