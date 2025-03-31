// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import reducePermissionsArray from './reducePermissionsArray';

describe('reducePermissionsArray', () => {
    describe('Extract permission from an array of permissions', () => {
        const {reducePermissionsArray: helperFunc} = reducePermissionsArray();

        test('Only false', async () => {
            expect(helperFunc([false, false, false])).toBe(false);
        });

        test('Only true', async () => {
            expect(helperFunc([true, true, true])).toBe(true);
        });

        test('True and false', async () => {
            expect(helperFunc([true, false, true, true, false])).toBe(true);
        });
    });
});
