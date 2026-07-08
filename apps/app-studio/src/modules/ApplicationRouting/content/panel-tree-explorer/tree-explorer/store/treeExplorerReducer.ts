import {type INavigationElement, type ITreeExplorerSelectedNode} from '../_types';

export interface ITreeExplorerState {
    /** The drill-down path: one element per open column beyond the root. */
    path: INavigationElement[];
    selection: {
        selected: ITreeExplorerSelectedNode[];
        /** Node id of the column the selection was made in (null = root). */
        parent: string | null;
    };
}

export const treeExplorerInitialState: ITreeExplorerState = {
    path: [],
    selection: {selected: [], parent: null},
};

export type TreeExplorerAction =
    | {type: 'SET_PATH'; path: INavigationElement[]}
    | {type: 'SET_SELECTION'; selected: ITreeExplorerSelectedNode[]; parent: string | null}
    | {type: 'RESET_SELECTION'}
    | {type: 'RESET'};

export const treeExplorerReducer = (state: ITreeExplorerState, action: TreeExplorerAction): ITreeExplorerState => {
    switch (action.type) {
        case 'SET_PATH':
            return {...state, path: action.path};
        case 'SET_SELECTION':
            return {...state, selection: {selected: action.selected, parent: action.parent}};
        case 'RESET_SELECTION':
            return {...state, selection: treeExplorerInitialState.selection};
        case 'RESET':
            return treeExplorerInitialState;
        default:
            return state;
    }
};
