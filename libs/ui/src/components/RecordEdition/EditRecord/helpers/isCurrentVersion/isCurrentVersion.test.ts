// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValueVersion} from '_ui/types/values';
import isCurrentVersion from './isCurrentVersion';

describe('isCurrentVersion', () => {
    test('Check if 2 given versions are strictly equals', async () => {
        const refVersion: IValueVersion = {
            tree1: {
                id: '123456',
                label: 'Some tree node'
            },
            tree2: {
                id: '987654',
                label: 'Some tree node'
            }
        };

        const otherVersionWithOneDifference: IValueVersion = {
            tree1: {
                id: '123457',
                label: 'Some tree node'
            },
            tree2: {
                id: '987654',
                label: 'Some tree node'
            }
        };

        const otherVersionWithTwoDifferences: IValueVersion = {
            tree1: {
                id: '111111',
                label: 'Some tree node'
            },
            tree2: {
                id: '222222',
                label: 'Some tree node'
            }
        };

        const otherVersionWithMoreKeys: IValueVersion = {
            tree1: {
                id: '123456',
                label: 'Some tree node'
            },
            tree2: {
                id: '987654',
                label: 'Some tree node'
            },
            tree3: {
                id: '456123',
                label: 'Some tree node'
            }
        };

        const otherVersionWithDifferentKeys: IValueVersion = {
            tree1: {
                id: '123456',
                label: 'Some tree node'
            },
            tree42: {
                id: '987654',
                label: 'Some tree node'
            }
        };

        const otherVersionWithOneKey: IValueVersion = {
            tree1: {
                id: '123456',
                label: 'Some tree node'
            }
        };

        expect(isCurrentVersion(refVersion, refVersion)).toBe(true);
        expect(isCurrentVersion(refVersion, otherVersionWithOneKey)).toBe(true);
        expect(isCurrentVersion(null, null)).toBe(true);
        expect(isCurrentVersion(undefined, undefined)).toBe(true);

        expect(isCurrentVersion(refVersion, otherVersionWithOneDifference)).toBe(false);
        expect(isCurrentVersion(refVersion, otherVersionWithTwoDifferences)).toBe(false);
        expect(isCurrentVersion(refVersion, otherVersionWithMoreKeys)).toBe(false);
        expect(isCurrentVersion(refVersion, otherVersionWithDifferentKeys)).toBe(false);
        expect(isCurrentVersion(refVersion, null)).toBe(false);
        expect(isCurrentVersion(null, otherVersionWithOneKey)).toBe(false);
    });
});
