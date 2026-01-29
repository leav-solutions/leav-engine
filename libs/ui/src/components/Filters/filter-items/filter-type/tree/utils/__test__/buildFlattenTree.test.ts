// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {buildFlattenTree} from '../buildFlattenTreeMap';
import {type ITreeNode} from '../../useGetTreeData';

describe('buildFlattenTree', () => {
    const createNode = (overrides: Partial<ITreeNode> = {}): ITreeNode => ({
        id: overrides.id ?? 'root',
        key: overrides.key ?? overrides.id ?? 'root',
        title: overrides.title ?? 'Root',
        children: overrides.children ?? [],
        accessRecordByDefaultPermission: overrides.accessRecordByDefaultPermission,
        libraryId: overrides.libraryId ?? 'library-id',
        recordId: overrides.recordId ?? 'record-id',
    });

    it('should return an empty map when the list is empty', () => {
        const result = buildFlattenTree([]);

        expect(result.size).toBe(0);
    });

    it('should flatten a tree with a single level', () => {
        const nodes: ITreeNode[] = [createNode({id: 'node-1'}), createNode({id: 'node-2'}), createNode({id: 'node-3'})];

        const result = buildFlattenTree(nodes);

        expect(Array.from(result.keys())).toEqual(['node-1', 'node-2', 'node-3']);
        expect(result.get('node-1')).toBe(nodes[0]);
        expect(result.get('node-2')).toBe(nodes[1]);
        expect(result.get('node-3')).toBe(nodes[2]);
    });

    it('should flatten a tree with multiple levels', () => {
        const nodes: ITreeNode[] = [
            createNode({
                id: 'parent',
                children: [
                    createNode({
                        id: 'child-1',
                        children: [createNode({id: 'grandchild-1'})],
                    }),
                    createNode({id: 'child-2'}),
                ],
            }),
        ];

        const result = buildFlattenTree(nodes);

        expect(Array.from(result.keys())).toEqual(['parent', 'child-1', 'grandchild-1', 'child-2']);
        expect(result.get('parent')).toBe(nodes[0]);
        expect(result.get('child-1')).toBe(nodes[0].children[0]);
        expect(result.get('grandchild-1')).toBe(nodes[0].children[0].children[0]);
        expect(result.get('child-2')).toBe(nodes[0].children[1]);
    });
});
