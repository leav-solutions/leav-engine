// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockTree} from '../../../__mocks__/common/tree';
import treeSelectionListReducer, {
    TreesSelectionListAction,
    TreesSelectionListActionTypes,
    ITreesSelectionListState,
    initialState
} from './treesSelectionListReducer';

describe('treesSelectionListReducer', () => {
    const state: ITreesSelectionListState = {
        ...initialState
    };

    describe('SET_TREES', () => {
        const action: TreesSelectionListAction = {
            type: TreesSelectionListActionTypes.SET_TREES,
            trees: [mockTree]
        };

        test('Set trees', async () => {
            expect(
                treeSelectionListReducer(state, {
                    ...action
                }).trees
            ).toEqual([mockTree]);
        });
    });

    describe('TOGGLE_TREE_ADD/DEL', () => {
        const addAction: TreesSelectionListAction = {
            type: TreesSelectionListActionTypes.TOGGLE_TREE_ADD,
            tree: mockTree
        };

        const delAction: TreesSelectionListAction = {
            type: TreesSelectionListActionTypes.TOGGLE_TREE_DEL,
            tree: mockTree
        };

        test('Select new tree', async () => {
            expect(
                treeSelectionListReducer(state, {
                    ...addAction
                }).selectedTrees
            ).toEqual([mockTree]);
        });

        test('delete new tree', async () => {
            expect(
                treeSelectionListReducer(state, {
                    ...delAction
                }).selectedTrees
            ).toEqual([]);
        });
    });

    describe('MOVE_SELECTED_TREE', () => {
        const action: TreesSelectionListAction = {
            type: TreesSelectionListActionTypes.MOVE_SELECTED_TREE,
            from: 0,
            to: 1
        };

        const stateWithSelection = {
            ...state,
            selectedTrees: [mockTree]
        };

        test('Move a selected tree', async () => {
            expect(
                treeSelectionListReducer(stateWithSelection, {
                    ...action
                }).selectedTrees
            ).toEqual([mockTree]);
        });

        test('Handle destination above selection length', async () => {
            expect(
                treeSelectionListReducer(stateWithSelection, {
                    ...action,
                    to: 42
                }).selectedTrees
            ).toEqual([mockTree]);
        });

        test('Handle destination below 0', async () => {
            expect(
                treeSelectionListReducer(stateWithSelection, {
                    ...action,
                    from: 1,
                    to: -42
                }).selectedTrees
            ).toEqual([mockTree]);
        });

        test('Handle invalid source (index not existing)', async () => {
            expect(
                treeSelectionListReducer(stateWithSelection, {
                    ...action,
                    from: 42
                }).selectedTrees
            ).toEqual([mockTree]);
        });
    });
});
