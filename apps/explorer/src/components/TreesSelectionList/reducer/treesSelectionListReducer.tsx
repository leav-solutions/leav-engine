// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_TREE_LIST_QUERY_trees_list} from '../../../_gqlTypes/GET_TREE_LIST_QUERY';
import {ITree} from '../../../_types/types';
import {reorder} from '../../../utils';

export interface ITreesSelectionListState {
    library: string;
    selectedTrees: ITree[];
    multiple: boolean;
    trees: GET_TREE_LIST_QUERY_trees_list[];
}

export enum TreesSelectionListActionTypes {
    SET_TREES = 'SET_TREES',
    TOGGLE_TREE_ADD = 'TOGGLE_TREE_ADD',
    TOGGLE_TREE_DEL = 'TOGGLE_TREE_DEL',
    MOVE_SELECTED_TREE = 'MOVE_SELECTED_TREE'
}

export type TreesSelectionListAction =
    | {
          type: TreesSelectionListActionTypes.SET_TREES;
          trees: GET_TREE_LIST_QUERY_trees_list[];
      }
    | {
          type: TreesSelectionListActionTypes.TOGGLE_TREE_ADD;
          tree: ITree;
      }
    | {
          type: TreesSelectionListActionTypes.TOGGLE_TREE_DEL;
          tree: ITree;
      }
    | {
          type: TreesSelectionListActionTypes.MOVE_SELECTED_TREE;
          from: number;
          to: number;
      };

export const initialState: ITreesSelectionListState = {
    selectedTrees: [],
    trees: [],
    library: '',
    multiple: true
};

const treeSelectionListReducer = (
    state: ITreesSelectionListState,
    action: TreesSelectionListAction
): ITreesSelectionListState => {
    switch (action.type) {
        case TreesSelectionListActionTypes.SET_TREES: {
            return {...state, trees: action.trees};
        }
        case TreesSelectionListActionTypes.TOGGLE_TREE_ADD: {
            const newSelection = [...state.selectedTrees, action.tree];

            return {
                ...state,
                selectedTrees: newSelection
            };
        }
        case TreesSelectionListActionTypes.TOGGLE_TREE_DEL: {
            const newSelection = [...state.selectedTrees];
            const index = newSelection.map(t => t.id).indexOf(action.tree.id);

            if (index > -1) {
                newSelection.splice(index, 1);
            }

            return {
                ...state,
                selectedTrees: newSelection
            };
        }
        case TreesSelectionListActionTypes.MOVE_SELECTED_TREE: {
            let newSelection = [...state.selectedTrees];
            let {from, to} = action;

            if (!newSelection[from]) {
                return state;
            }

            if (to > newSelection.length - 1) {
                to = newSelection.length - 1;
            }

            if (from < 0) {
                from = 0;
            }

            newSelection = reorder(newSelection, from, to);

            return {
                ...state,
                selectedTrees: newSelection
            };
        }
    }
};

export default treeSelectionListReducer;
