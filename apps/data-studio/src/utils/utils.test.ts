// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActiveTree} from 'graphQL/queries/cache/activeTree/getActiveTreeQuery';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {IValueVersion} from '_types/types';
import {mockActiveTree} from '__mocks__/common/activeTree';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockTreeRecord} from '__mocks__/common/treeElements';
import {mockSelectedAttributeB} from '../__mocks__/common/attribute';
import {
    getFilesLibraryId,
    getInitials,
    getTreeRecordKey,
    getValueVersionLabel,
    isAttributeSelected,
    isLibraryInApp,
    isTreeInApp
} from './utils';

describe('utils', () => {
    describe('isAttributeSelected', () => {
        test('Return true if attribute selected', async () => {
            expect(
                isAttributeSelected('A.B', [
                    {
                        ...mockSelectedAttributeB,
                        path: 'A.B'
                    }
                ])
            ).toBe(true);
        });

        test('Return false if attribute not selected', async () => {
            expect(
                isAttributeSelected('C', [
                    {
                        ...mockSelectedAttributeB,
                        path: 'A.B'
                    }
                ])
            ).toBe(false);
        });
    });

    describe('getTreeRecordKey', () => {
        test('Return record key', async () => {
            expect(getTreeRecordKey({...mockTreeRecord})).toBe('library-id/id');
        });
    });

    describe('isLibraryInApp', () => {
        test('Check if library is available in current app', async () => {
            expect(isLibraryInApp(mockApplicationDetails, 'libA')).toBe(true);
            expect(isLibraryInApp(mockApplicationDetails, 'libB')).toBe(true);
            expect(isLibraryInApp(mockApplicationDetails, 'libC')).toBe(false);
            expect(isLibraryInApp({...mockApplicationDetails, settings: {libraries: 'all'}}, 'libC')).toBe(true);
        });
    });

    describe('isTreeInApp', () => {
        test('Check if tree is available in current app', async () => {
            expect(isTreeInApp(mockApplicationDetails, 'treeA')).toBe(true);
            expect(isTreeInApp(mockApplicationDetails, 'treeB')).toBe(true);
            expect(isTreeInApp(mockApplicationDetails, 'treeC')).toBe(false);
            expect(isTreeInApp({...mockApplicationDetails, settings: {trees: 'all'}}, 'treeC')).toBe(true);
            expect(isTreeInApp({...mockApplicationDetails, settings: {trees: 'none'}}, 'treeA')).toBe(false);
        });
    });

    describe('getInitials', () => {
        test('Return label initials for given length', async () => {
            expect(getInitials('Dwight Schrute', 2)).toBe('DS');
            expect(getInitials('Dwight Schrute', 1)).toBe('D');
            expect(getInitials('Dwight', 2)).toBe('DW');
        });
    });

    describe('getValueVersionLabel', () => {
        test('Compute version label based on all version trees', async () => {
            const version: IValueVersion = {
                tree1: {
                    id: '123456',
                    label: 'Node title'
                },
                tree2: {
                    id: '987654',
                    label: 'Other Node'
                }
            };

            expect(getValueVersionLabel(version)).toBe('Node title / Other Node');
            expect(getValueVersionLabel(null)).toBe('');
        });
    });

    describe('getFilesLibraryId', () => {
        test('Return files library ID if any', async () => {
            const activeTree: IActiveTree = {
                ...mockActiveTree,
                libraries: [
                    {
                        id: 'directories_library_id',
                        behavior: LibraryBehavior.directories
                    },
                    {
                        id: 'files_library_id',
                        behavior: LibraryBehavior.files
                    }
                ]
            };

            expect(getFilesLibraryId(activeTree)).toBe('files_library_id');
        });

        test('If no files library, return null', async () => {
            const activeTree: IActiveTree = {
                ...mockActiveTree
            };

            expect(getFilesLibraryId(activeTree)).toBe(null);
        });
    });
});
