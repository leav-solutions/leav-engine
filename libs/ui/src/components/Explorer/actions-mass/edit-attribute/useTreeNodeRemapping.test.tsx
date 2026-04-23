// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook} from '_ui/_tests/testUtils';
import {type MassEditTreeNode} from './_types';
import {useTreeNodeRemapping} from './useTreeNodeRemapping';

const nodeA: MassEditTreeNode = {id: 'node_a', label: 'Node A'};
const nodeB: MassEditTreeNode = {id: 'node_b', label: 'Node B'};
const nodeC: MassEditTreeNode = {id: 'node_c', label: 'Node C'};

describe('useTreeNodeRemapping', () => {
    describe('for each distribution occurrence', () => {
        it('should map to its currentNode and occurrenceCount', () => {
            const {
                result: {current},
            } = renderHook(() =>
                useTreeNodeRemapping({
                    distribution: [{count: 5, treeNodeId: 'node_a'}],
                    editableNodes: [{...nodeA, allowedDependentNodeIds: []}, nodeB],
                }),
            );

            expect(current.length).toBe(1);
            expect(current[0].currentNode).toEqual({...nodeA, allowedDependentNodeIds: []});
            expect(current[0].occurrenceCount).toBe(5);
        });

        it('should always include the "do not change" option as first candidate', () => {
            const {
                result: {current},
            } = renderHook(() =>
                useTreeNodeRemapping({
                    distribution: [{count: 3, treeNodeId: 'node_a'}],
                    editableNodes: [{...nodeA, allowedDependentNodeIds: []}, nodeB],
                }),
            );

            expect(current[0].candidateNodes[0]).toEqual({
                id: 'node_a',
                label: 'explorer.massAction.editAttribute_value_do_not_change',
            });
        });

        it('should exclude the current node from candidates', () => {
            const {
                result: {current},
            } = renderHook(() =>
                useTreeNodeRemapping({
                    distribution: [{count: 3, treeNodeId: 'node_a'}],
                    editableNodes: [{...nodeA, allowedDependentNodeIds: []}, nodeB, nodeC],
                }),
            );

            const [_ignoreDoNotChange, ...restNodes] = current[0].candidateNodes;
            expect(restNodes.map(n => n.id)).not.toContain('node_a');
        });
    });

    describe('candidate filtering by allowedDependentNodeIds', () => {
        it('should include all other nodes when allowedDependentNodeIds is an empty array', () => {
            const {
                result: {current},
            } = renderHook(() =>
                useTreeNodeRemapping({
                    distribution: [{count: 3, treeNodeId: 'node_a'}],
                    editableNodes: [{...nodeA, allowedDependentNodeIds: []}, nodeB, nodeC],
                }),
            );

            const filteredCandidates = current[0].candidateNodes;
            expect(filteredCandidates.map(n => n.id)).toEqual(['node_a', 'node_b', 'node_c']);
        });

        it('should include only allowed nodes when allowedDependentNodeIds contains specific ids', () => {
            const {
                result: {current},
            } = renderHook(() =>
                useTreeNodeRemapping({
                    distribution: [{count: 3, treeNodeId: 'node_a'}],
                    editableNodes: [{...nodeA, allowedDependentNodeIds: ['node_b']}, nodeB, nodeC],
                }),
            );

            const filteredCandidates = current[0].candidateNodes.slice(1);
            expect(filteredCandidates.map(n => n.id)).toEqual(['node_b']);
        });
    });
});
