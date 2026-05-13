import {useContext} from 'react';
import {EditRecordReducerContext} from './editRecordReducerContext';

export const useEditRecordReducer = () => useContext(EditRecordReducerContext);
