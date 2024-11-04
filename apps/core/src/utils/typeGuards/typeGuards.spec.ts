// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TypeGuards} from '.';

describe('typeGuards', () => {
    describe('isIValue', () => {
        test('should return true value is an object', () => {
            expect(TypeGuards.isVariableIValue({} as any)).toBe(true);
            expect(TypeGuards.isVariableIValue([] as any)).toBe(true);
            expect(TypeGuards.isVariableIValue({field: 'value'} as any)).toBe(true);
        });
        test('should return false value is not an object', () => {
            expect(TypeGuards.isVariableIValue(42 as any)).toBe(false);
            expect(TypeGuards.isVariableIValue('' as any)).toBe(false);
            expect(TypeGuards.isVariableIValue(true as any)).toBe(false);
            expect(TypeGuards.isVariableIValue((() => null) as any)).toBe(false);
        });
    });

    describe('isIStandardValue', () => {
        test('should return true value if contains "raw_payload" field', () => {
            expect(TypeGuards.isIStandardValue({raw_payload: 'value'} as any)).toBe(true);
            expect(TypeGuards.isIStandardValue({raw_payload: 'value', other_value: 42} as any)).toBe(true);
        });
        test('should return false value if "raw_payload" field is missing', () => {
            expect(TypeGuards.isIStandardValue({} as any)).toBe(false);
            expect(TypeGuards.isIStandardValue([] as any)).toBe(false);
            expect(TypeGuards.isIStandardValue({field: 'value'} as any)).toBe(false);
        });
    });
});
