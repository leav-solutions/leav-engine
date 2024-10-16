import {useContext} from 'react';
import {StandardFieldReducerContext} from './standardFieldReducerContext';

export const useStandardFieldReducer = () => useContext(StandardFieldReducerContext);
