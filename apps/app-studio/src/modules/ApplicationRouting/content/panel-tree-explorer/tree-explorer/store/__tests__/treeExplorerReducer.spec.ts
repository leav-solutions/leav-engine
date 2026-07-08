import {type INavigationElement, type ITreeExplorerSelectedNode} from '../../_types';
import {treeExplorerInitialState, treeExplorerReducer} from '../treeExplorerReducer';

const aNode = (id: string): INavigationElement =>
    ({
        id,
        childrenCount: 0,
        record: {id: `rec-${id}`, whoAmI: {id: `rec-${id}`, library: {id: 'lib'}}},
        permissions: {access_tree: true, detach: true, edit_children: true},
    }) as unknown as INavigationElement;

const aSelectedNode = (nodeId: string): ITreeExplorerSelectedNode => ({
    id: `rec-${nodeId}`,
    nodeId,
    library: 'lib',
    label: nodeId,
});

describe('treeExplorerReducer', () => {
    it('sets the navigation path', () => {
        const path = [aNode('a'), aNode('b')];

        const state = treeExplorerReducer(treeExplorerInitialState, {type: 'SET_PATH', path});

        expect(state.path).toEqual(path);
        expect(state.selection).toEqual(treeExplorerInitialState.selection);
    });

    it('sets the selection with its parent', () => {
        const selected = [aSelectedNode('a')];

        const state = treeExplorerReducer(treeExplorerInitialState, {
            type: 'SET_SELECTION',
            selected,
            parent: 'parent-node',
        });

        expect(state.selection).toEqual({selected, parent: 'parent-node'});
    });

    it('resets the selection while keeping the path', () => {
        const withData = treeExplorerReducer(
            {path: [aNode('a')], selection: {selected: [aSelectedNode('a')], parent: 'p'}},
            {type: 'RESET_SELECTION'},
        );

        expect(withData.path).toHaveLength(1);
        expect(withData.selection).toEqual(treeExplorerInitialState.selection);
    });

    it('resets the whole state when switching tree', () => {
        const state = treeExplorerReducer(
            {path: [aNode('a')], selection: {selected: [aSelectedNode('a')], parent: 'p'}},
            {type: 'RESET'},
        );

        expect(state).toEqual(treeExplorerInitialState);
    });
});
