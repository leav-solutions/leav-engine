// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {countSelectedTreeChildren} from '../countSelectedTreeChildren';
import {type ITreeNode} from '../../useGetTreeData';

const createNode = (overrides: Partial<ITreeNode> = {}): ITreeNode => ({
    id: overrides.id ?? 'root',
    key: overrides.key ?? overrides.id ?? 'root',
    title: overrides.title ?? 'Root',
    children: overrides.children ?? [],
    libraryId: overrides.libraryId ?? 'library-id',
    recordId: overrides.recordId ?? 'record-id',
    accessRecordByDefaultPermission: overrides.accessRecordByDefaultPermission,
});

describe('countSelectedTreeChildren', () => {
    it('should return 0 when node has no children', () => {
        const node = createNode();
        expect(countSelectedTreeChildren(node, ['root'])).toBe(0);
    });

    it('should return 0 when no children are selected', () => {
        const node = createNode({
            children: [createNode({id: 'child-1'}), createNode({id: 'child-2'})],
        });
        expect(countSelectedTreeChildren(node, [])).toBe(0);
    });

    it('should count only selected direct children', () => {
        const node = createNode({
            children: [createNode({id: 'child-1'}), createNode({id: 'child-2'}), createNode({id: 'child-3'})],
        });
        expect(countSelectedTreeChildren(node, ['child-1', 'child-3'])).toBe(2);
    });

    it('should count selected descendants recursively across multiple levels', () => {
        const node = createNode({
            children: [
                createNode({
                    id: 'child-1',
                    children: [createNode({id: 'grandchild-1'}), createNode({id: 'grandchild-2'})],
                }),
                createNode({id: 'child-2'}),
            ],
        });
        // child-1 and grandchild-1 selected, grandchild-2 and child-2 not
        expect(countSelectedTreeChildren(node, ['child-1', 'grandchild-1'])).toBe(2);
    });

    it('should not count the root node itself even if it is in selectedIds', () => {
        const node = createNode({
            id: 'root',
            children: [createNode({id: 'child-1'})],
        });
        expect(countSelectedTreeChildren(node, ['root', 'child-1'])).toBe(1);
    });

    it('should count all descendants when all are selected', () => {
        const node = createNode({
            children: [
                createNode({
                    id: 'child-1',
                    children: [createNode({id: 'grandchild-1'})],
                }),
                createNode({id: 'child-2'}),
            ],
        });
        // child-1 + grandchild-1 + child-2 = 3
        expect(countSelectedTreeChildren(node, ['child-1', 'grandchild-1', 'child-2'])).toBe(3);
    });
});
