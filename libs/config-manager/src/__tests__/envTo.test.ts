// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {envToBool, envToNumber, envToStringArray} from '../envTo';

describe('envTo', () => {
    describe('envToBool', () => {
        it('should return true for "true", "1", "yes", (case insensitive)', () => {
            expect(envToBool('true')).toBe(true);
            expect(envToBool('TRUE')).toBe(true);
            expect(envToBool('1')).toBe(true);
            expect(envToBool('yes')).toBe(true);
            expect(envToBool('  yes  ')).toBe(true);
        });

        it('should return false for "false", "0", "no" (case insensitive)', () => {
            expect(envToBool('false')).toBe(false);
            expect(envToBool('FALSE')).toBe(false);
            expect(envToBool('0')).toBe(false);
            expect(envToBool('no')).toBe(false);
            expect(envToBool('  no  ')).toBe(false);
        });

        it('should return defaultValue for unrecognized strings', () => {
            expect(envToBool('maybe', true)).toBe(true);
            expect(envToBool('maybe', false)).toBe(false);
            expect(envToBool('', true)).toBe(true);
            expect(envToBool('   ', true)).toBe(true);
        });

        it('should return defaultValue for undefined, or empty string', () => {
            expect(envToBool(undefined as unknown as string, true)).toBe(true);
            expect(envToBool(undefined as unknown as string, false)).toBe(false);
            expect(envToBool('', true)).toBe(true);
            expect(envToBool('', false)).toBe(false);
        });
    });

    describe('envToNumber', () => {
        it('should convert valid number strings to numbers', () => {
            expect(envToNumber('42')).toBe(42);
            expect(envToNumber('3.14')).toBe(3.14);
            expect(envToNumber('-7')).toBe(-7);
            expect(envToNumber('  100  ')).toBe(100);
        });

        it('should return defaultValue for invalid number strings', () => {
            expect(envToNumber('abc', 10)).toBe(10);
            expect(envToNumber('', 5)).toBe(5);
            expect(envToNumber('   ', 7)).toBe(7);
            expect(envToNumber(undefined as unknown as string, 3)).toBe(3);
        });

        it('should return 0 as defaultValue if not provided', () => {
            expect(envToNumber('not a number')).toBe(0);
            expect(envToNumber('NaN')).toBe(0);
            expect(envToNumber('not a number', 12)).toBe(12);
            expect(envToNumber('NaN', 13)).toBe(13);
        });
    });

    describe('envToStringArray', () => {
        it('should split a comma-separated string into an array', () => {
            expect(envToStringArray('a,b,c')).toEqual(['a', 'b', 'c']);
            expect(envToStringArray('  a , b ,c  ')).toEqual(['a', 'b', 'c']);
        });

        it('should handle custom separators', () => {
            expect(envToStringArray('a|b|c', '|')).toEqual(['a', 'b', 'c']);
            expect(envToStringArray('x;y;z', ';')).toEqual(['x', 'y', 'z']);
        });

        it('should trim whitespace from each item', () => {
            expect(envToStringArray('  foo ,  bar ,baz  ')).toEqual(['foo', 'bar', 'baz']);
        });

        it('should filter out empty strings', () => {
            expect(envToStringArray('a,,b, ,c')).toEqual(['a', 'b', 'c']);
            expect(envToStringArray(' , , ')).toEqual([]);
        });

        it('should return defaultValue for empty, undefined, or non-string input', () => {
            expect(envToStringArray('', ',', ['default'])).toEqual(['default']);
            expect(envToStringArray(undefined as unknown as string, ',', ['def'])).toEqual(['def']);
            expect(envToStringArray(null as unknown as string, ',', ['x'])).toEqual(['x']);
            expect(envToStringArray(123 as unknown as string, ',', ['num'])).toEqual(['num']);
        });

        it('should return empty array if no defaultValue and input is empty', () => {
            expect(envToStringArray('')).toEqual([]);
            expect(envToStringArray('   ')).toEqual([]);
        });

        it('should handle single value', () => {
            expect(envToStringArray('single')).toEqual(['single']);
            expect(envToStringArray('  single  ')).toEqual(['single']);
        });
    });
});
