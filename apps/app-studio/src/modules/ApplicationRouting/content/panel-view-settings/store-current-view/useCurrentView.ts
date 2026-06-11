import {useCallback, useContext, useMemo} from 'react';
import {useLang} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {type ViewV2Types} from '../../../../../__generated__';
import {CurrentViewContext} from './CurrentViewContext';

export const useCurrentView = () => {
    const {view, dispatch} = useContext(CurrentViewContext);
    const {lang} = useLang();

    const setViewType = useCallback(
        (viewType: ViewV2Types) => dispatch({type: 'SET_VIEW_TYPE', payload: {viewType}}),
        [dispatch],
    );

    const toggleVisibility = useCallback(
        (id: string) => dispatch({type: 'TOGGLE_VISIBILITY', payload: {id}}),
        [dispatch],
    );

    const moveAttribute = useCallback(
        (activeId: string, overId: string) => dispatch({type: 'MOVE_ATTRIBUTE', payload: {activeId, overId}}),
        [dispatch],
    );

    // Visible columns keep the view-defined order. Hidden columns are sorted alphabetically.
    const visibleColumns = useMemo(() => view?.display.attributes.filter(attr => attr.visible) ?? [], [view]);

    const invisibleColumns = useMemo(() => {
        if (!view) {
            return [];
        }
        return view.display.attributes
            .filter(attr => !attr.visible)
            .slice()
            .sort((a, b) => {
                const labelA = a.attribute.label ? localizedTranslation(a.attribute.label, lang) : a.attribute.id;
                const labelB = b.attribute.label ? localizedTranslation(b.attribute.label, lang) : b.attribute.id;
                return labelA.localeCompare(labelB);
            });
    }, [view, lang]);

    return {view, dispatch, setViewType, toggleVisibility, moveAttribute, visibleColumns, invisibleColumns};
};
