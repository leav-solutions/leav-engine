import {type ReactNode, useEffect, useReducer} from 'react';
import {useGetViewV2Query} from '../../../../../__generated__';
import {CurrentViewContext} from './CurrentViewContext';
import {currentViewReducer, initialCurrentViewState} from './currentViewReducer';

// TODO (LEAVC-809): load the panel's real currentViewId once views are migrated to viewV2.
// For now we hardcode the v2 view to wire the reducer end-to-end.
const HARDCODED_VIEW_ID = '2345316100';

export const CurrentViewProvider = ({children}: {children: ReactNode}) => {
    const [view, dispatch] = useReducer(currentViewReducer, initialCurrentViewState);

    const {data} = useGetViewV2Query({variables: {viewId: HARDCODED_VIEW_ID}});

    useEffect(() => {
        if (data?.viewV2) {
            dispatch({type: 'LOAD_VIEW', payload: data.viewV2});
        }
    }, [data]);

    return <CurrentViewContext.Provider value={{view, dispatch}}>{children}</CurrentViewContext.Provider>;
};
