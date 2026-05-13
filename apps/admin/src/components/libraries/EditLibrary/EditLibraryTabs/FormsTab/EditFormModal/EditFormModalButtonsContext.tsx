import {createContext} from 'react';

export interface IEditFormModalButtonsContext {
    buttons: {[key: string]: JSX.Element};
    setButton: (key: string, button: JSX.Element) => void;
    removeButton: (key: string) => void;
}

export const EditFormModalButtonsContext = createContext<IEditFormModalButtonsContext>(null);
