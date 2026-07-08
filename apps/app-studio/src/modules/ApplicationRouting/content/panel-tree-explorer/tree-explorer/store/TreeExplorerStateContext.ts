import {createContext} from 'react';
import {type INavigationElement, type ITreeExplorerSelectedNode, type ITreeExplorerTree} from '../_types';
import {type ITreeExplorerState} from './treeExplorerReducer';

export interface ITreeExplorerContextValue {
    /** Tree metadata, loaded once by the root component. */
    activeTree: ITreeExplorerTree;
    path: INavigationElement[];
    selection: ITreeExplorerState['selection'];
    setPath: (path: INavigationElement[]) => void;
    setSelection: (selected: ITreeExplorerSelectedNode[], parent: string | null) => void;
    resetSelection: () => void;
}

export const TreeExplorerStateContext = createContext<ITreeExplorerContextValue | null>(null);
