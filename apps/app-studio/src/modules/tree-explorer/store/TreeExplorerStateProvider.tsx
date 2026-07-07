import {type FunctionComponent, type ReactNode, useCallback, useEffect, useMemo, useReducer} from 'react';
import {type INavigationElement, type ITreeExplorerSelectedNode, type ITreeExplorerTree} from '../_types';
import {TreeExplorerStateContext} from './TreeExplorerStateContext';
import {treeExplorerInitialState, treeExplorerReducer} from './treeExplorerReducer';

interface ITreeExplorerStateProviderProps {
    activeTree: ITreeExplorerTree;
    children: ReactNode;
}

/**
 * Holds the tree explorer local state (drill-down path + node selection).
 * Replaces the data-studio Redux `navigation` and `selection` slices so the
 * component is self-contained inside app-studio.
 */
export const TreeExplorerStateProvider: FunctionComponent<ITreeExplorerStateProviderProps> = ({
    activeTree,
    children,
}) => {
    const [state, dispatch] = useReducer(treeExplorerReducer, treeExplorerInitialState);

    // Switching to another tree resets both the path and the selection.
    useEffect(() => {
        dispatch({type: 'RESET'});
    }, [activeTree.id]);

    const setPath = useCallback((path: INavigationElement[]) => dispatch({type: 'SET_PATH', path}), []);
    const setSelection = useCallback(
        (selected: ITreeExplorerSelectedNode[], parent: string | null) =>
            dispatch({type: 'SET_SELECTION', selected, parent}),
        [],
    );
    const resetSelection = useCallback(() => dispatch({type: 'RESET_SELECTION'}), []);

    const value = useMemo(
        () => ({
            activeTree,
            path: state.path,
            selection: state.selection,
            setPath,
            setSelection,
            resetSelection,
        }),
        [activeTree, state.path, state.selection, setPath, setSelection, resetSelection],
    );

    return <TreeExplorerStateContext.Provider value={value}>{children}</TreeExplorerStateContext.Provider>;
};
