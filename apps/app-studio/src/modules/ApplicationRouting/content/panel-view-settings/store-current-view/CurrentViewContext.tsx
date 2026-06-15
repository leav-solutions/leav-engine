import {createContext, type Dispatch} from 'react';
import {type CurrentViewAction, type CurrentView} from './_types';

export const CurrentViewContext = createContext<{
    view: CurrentView;
    savedView: CurrentView;
    dispatch: Dispatch<CurrentViewAction>;
}>({
    view: null,
    savedView: null,
    dispatch: () => {
        throw new Error('useCurrentView must be used inside a <CurrentViewProvider />');
    },
});
