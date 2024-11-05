// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import reducePermissionsArray from './reducePermissionsArray';

describe('reducePermissionsArray', () => {
    describe('Extract permission from an array of permissions', () => {
        const {reducePermissionsArray: helperFunc} = reducePermissionsArray();

        test('Only nulls', async () => {
            expect(helperFunc([null, null, null])).toBe(null);
        });

        test('Only false', async () => {
            expect(helperFunc([false, false, false])).toBe(false);
        });

        test('Only true', async () => {
            expect(helperFunc([true, true, true])).toBe(true);
        });

        test('Null and false', async () => {
            expect(helperFunc([null, false])).toBe(false);
            expect(helperFunc([false, null])).toBe(false);
            expect(helperFunc([false, null, null, null, false, null])).toBe(false);
        });

        test('Null and true', async () => {
            expect(helperFunc([null, true])).toBe(true);
            expect(helperFunc([true, null])).toBe(true);
        });

        test('Null and true and false', async () => {
            expect(helperFunc([null, true, false])).toBe(true);
            expect(helperFunc([true, null, false])).toBe(true);
            expect(helperFunc([null, false, true])).toBe(true);
            expect(helperFunc([false, true, null])).toBe(true);
            expect(helperFunc([null, null, false, true, null, false, true, null])).toBe(true);
        });
    });
});
