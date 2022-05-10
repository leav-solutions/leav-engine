// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockTreeRecord} from '__mocks__/common/treeElements';
import {mockSelectedAttributeB} from '../__mocks__/common/attribute';
import {getTreeRecordKey, isAttributeSelected, isLibraryInApp, isTreeInApp} from './utils';

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
            expect(isLibraryInApp({...mockApplicationDetails, libraries: []}, 'libC')).toBe(true);
        });
    });

    describe('isTreeInApp', () => {
        test('Check if tree is available in current app', async () => {
            expect(isTreeInApp(mockApplicationDetails, 'treeA')).toBe(true);
            expect(isTreeInApp(mockApplicationDetails, 'treeB')).toBe(true);
            expect(isTreeInApp(mockApplicationDetails, 'treeC')).toBe(false);
            expect(isTreeInApp({...mockApplicationDetails, trees: []}, 'treeC')).toBe(true);
        });
    });
});
