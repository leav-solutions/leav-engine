import {useCallback, useContext, useMemo} from 'react';
import {useLang, useUser} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {type ViewV2Types} from '../../../../../__generated__';
import {CurrentViewContext} from './CurrentViewContext';
import {type CurrentView} from './_types';

const displayFingerprint = (view: CurrentView) =>
    view ? JSON.stringify({label: view.label, display: view.display}) : null;

export const useCurrentView = () => {
    const {view, savedView, dispatch} = useContext(CurrentViewContext);
    const {lang} = useLang();
    const {userData} = useUser();

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

    const setLabel = useCallback(
        (value: string) => dispatch({type: 'SET_LABEL', payload: {lang: lang[0], value}}),
        [dispatch, lang],
    );

    const setShared = useCallback((shared: boolean) => dispatch({type: 'SET_SHARED', payload: {shared}}), [dispatch]);

    const resetView = useCallback(() => dispatch({type: 'RESET_VIEW'}), [dispatch]);

    const markSaved = useCallback(() => dispatch({type: 'MARK_SAVED'}), [dispatch]);

    // Ownership drives the whole owner/non-owner branching of the header.
    const isOwner = view?.created_by?.whoAmI?.id === userData?.userId;

    // "Dirty" = the editable label/display/filters/sorts diverged from the last persisted snapshot. `shared`,
    const isDirty = useMemo(() => displayFingerprint(view) !== displayFingerprint(savedView), [view, savedView]);

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

    return {
        view,
        savedView,
        dispatch,
        isOwner,
        isDirty,
        setViewType,
        toggleVisibility,
        moveAttribute,
        setLabel,
        setShared,
        resetView,
        markSaved,
        visibleColumns,
        invisibleColumns,
    };
};
