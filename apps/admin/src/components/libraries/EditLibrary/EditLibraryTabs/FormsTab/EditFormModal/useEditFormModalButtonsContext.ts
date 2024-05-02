// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useContext} from 'react';
import {EditFormModalButtonsContext, IEditFormModalButtonsContext} from './EditFormModalButtonsContext';

export const useEditFormModalButtonsContext = (): IEditFormModalButtonsContext =>
    useContext(EditFormModalButtonsContext);
