import {createContext, type Dispatch} from 'react';
import {type IViewSettingsAction, type IViewSettingsState} from './viewSettingsReducer';

export const ViewSettingsContext = createContext<{
    view: IViewSettingsState;
    dispatch: Dispatch<IViewSettingsAction>;
}>({
    view: null as any,
    dispatch: () => {
        throw new Error('useViewSettingsContext must be used inside a <ViewSettingsContext.Provider />');
    },
});
