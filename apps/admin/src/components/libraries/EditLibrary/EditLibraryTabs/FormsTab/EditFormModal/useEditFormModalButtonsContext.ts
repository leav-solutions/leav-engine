import {useContext} from 'react';
import {EditFormModalButtonsContext, type IEditFormModalButtonsContext} from './EditFormModalButtonsContext';

export const useEditFormModalButtonsContext = (): IEditFormModalButtonsContext =>
    useContext(EditFormModalButtonsContext);
