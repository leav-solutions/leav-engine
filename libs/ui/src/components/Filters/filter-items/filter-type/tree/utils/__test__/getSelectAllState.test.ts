import {getSelectAllState} from '../getSelectAllState';
import {type ITreeNode} from '../../useGetTreeData';

describe('getSelectAllState', () => {
    const createNode = (id: string): ITreeNode => ({
        id,
        key: id,
        title: id,
        children: [],
        accessRecordByDefaultPermission: true,
        libraryId: 'library-id',
        recordId: 'record-id',
    });

    const createFlattenTree = (ids: string[]): Map<string, ITreeNode> => {
        const map = new Map<string, ITreeNode>();
        ids.forEach(id => {
            map.set(id, createNode(id));
        });

        return map;
    };

    it('should return allSelected=false and indeterminate=false when the map is empty', () => {
        const state = getSelectAllState([], new Map());

        expect(state).toEqual({
            allSelected: false,
            indeterminate: false,
        });
    });

    it('should return allSelected=true and indeterminate=false when all ids are selected', () => {
        const flattenTree = createFlattenTree(['id-1', 'id-2', 'id-3']);

        const state = getSelectAllState(['id-1', 'id-2', 'id-3'], flattenTree);

        expect(state).toEqual({
            allSelected: true,
            indeterminate: false,
        });
    });

    it('should return allSelected=false and indeterminate=true when only a part is selected', () => {
        const flattenTree = createFlattenTree(['id-1', 'id-2', 'id-3']);

        const state = getSelectAllState(['id-1', 'id-3'], flattenTree);

        expect(state).toEqual({
            allSelected: false,
            indeterminate: true,
        });
    });

    it('should return allSelected=false and indeterminate=false when no id is selected', () => {
        const flattenTree = createFlattenTree(['id-1', 'id-2', 'id-3']);

        const state = getSelectAllState([], flattenTree);

        expect(state).toEqual({
            allSelected: false,
            indeterminate: false,
        });
    });
});
