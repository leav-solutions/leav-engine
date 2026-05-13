import {filterTreeByPermission} from '../filterTreeByPermission';
import {type ITreeNode} from '../../useGetTreeData';

describe('filterTreeByPermission', () => {
    const createNode = (overrides: Partial<ITreeNode> = {}): ITreeNode => ({
        id: overrides.id ?? 'root',
        key: overrides.key ?? overrides.id ?? 'root',
        title: overrides.title ?? 'Root',
        children: overrides.children ?? [],
        accessRecordByDefaultPermission: overrides.accessRecordByDefaultPermission,
        libraryId: overrides.libraryId ?? 'library-id',
        recordId: overrides.recordId ?? 'record-id',
    });

    it('should return an empty array when the list is empty', () => {
        const result = filterTreeByPermission([]);

        expect(result).toEqual([]);
    });

    it('should keep only the nodes that match the permission when there are no children', () => {
        const nodes: ITreeNode[] = [
            createNode({id: 'node-1', accessRecordByDefaultPermission: true}),
            createNode({id: 'node-2', accessRecordByDefaultPermission: false}),
        ];

        const result = filterTreeByPermission(nodes);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('node-1');
    });

    it('should keep a parent node if at least one child matches the permission', () => {
        const nodes: ITreeNode[] = [
            createNode({
                id: 'parent',
                accessRecordByDefaultPermission: false,
                children: [
                    createNode({id: 'child-1', accessRecordByDefaultPermission: false}),
                    createNode({id: 'child-2', accessRecordByDefaultPermission: true}),
                ],
            }),
        ];

        const result = filterTreeByPermission(nodes);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('parent');
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].id).toBe('child-2');
    });

    it('should not keep a parent node or its children if none match the permission', () => {
        const nodes: ITreeNode[] = [
            createNode({
                id: 'parent',
                accessRecordByDefaultPermission: false,
                children: [
                    createNode({id: 'child-1', accessRecordByDefaultPermission: false}),
                    createNode({id: 'child-2', accessRecordByDefaultPermission: false}),
                ],
            }),
        ];

        const result = filterTreeByPermission(nodes);

        expect(result).toHaveLength(0);
    });

    it('should not keep nodes with undefined permission', () => {
        const nodes: ITreeNode[] = [
            createNode({id: 'node-1', accessRecordByDefaultPermission: undefined}),
            createNode({id: 'node-2', accessRecordByDefaultPermission: false}),
            createNode({id: 'node-3', accessRecordByDefaultPermission: true}),
        ];

        const result = filterTreeByPermission(nodes);

        expect(result).toHaveLength(1);
        expect(result.map(n => n.id)).toEqual(['node-3']);
    });

    it('should return an empty array when no node has === true permission', () => {
        const nodes: ITreeNode[] = [
            createNode({id: 'node-1', accessRecordByDefaultPermission: undefined}),
            createNode({id: 'node-2', accessRecordByDefaultPermission: undefined}),
        ];

        const result = filterTreeByPermission(nodes);

        expect(result).toHaveLength(0);
    });

    it('should not keep nodes with false or undefined permission', () => {
        const nodes: ITreeNode[] = [
            createNode({id: 'node-1', accessRecordByDefaultPermission: undefined}),
            createNode({id: 'node-2', accessRecordByDefaultPermission: false}),
        ];

        const result = filterTreeByPermission(nodes);

        expect(result).toHaveLength(0);
    });

    it('should filter recursively on multiple levels', () => {
        const nodes: ITreeNode[] = [
            createNode({
                id: 'parent',
                accessRecordByDefaultPermission: false,
                children: [
                    createNode({
                        id: 'child-1',
                        accessRecordByDefaultPermission: false,
                        children: [createNode({id: 'grandchild-1', accessRecordByDefaultPermission: true})],
                    }),
                ],
            }),
        ];

        const result = filterTreeByPermission(nodes);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('parent');
        expect(result[0].children).toHaveLength(1);
        expect(result[0].children[0].id).toBe('child-1');
        expect(result[0].children[0].children).toHaveLength(1);
        expect(result[0].children[0].children[0].id).toBe('grandchild-1');
    });
});
