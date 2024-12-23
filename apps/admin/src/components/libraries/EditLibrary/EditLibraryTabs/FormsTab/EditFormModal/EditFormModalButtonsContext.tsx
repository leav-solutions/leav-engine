// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext} from 'react';
export interface IEditFormModalButtonsContext {
    buttons: {[key: string]: JSX.Element};
    setButton: (key: string, button: JSX.Element) => void;
    removeButton: (key: string) => void;
}

export const EditFormModalButtonsContext = createContext<IEditFormModalButtonsContext>(null);
