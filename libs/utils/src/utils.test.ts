// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileType} from './types/files';
import {
    extractArgsFromString,
    getCallStack,
    getFileType,
    getGraphqlQueryNameFromLibraryName,
    getGraphqlTypeFromLibraryName,
    getInitials,
    getInvertColor,
    localizedTranslation,
    nameValArrayToObj,
    objectToNameValueArray,
    omit,
    slugifyString,
    stringToColor
} from './utils';

describe('utils', () => {
    describe('getGraphqlQueryNameFromLibraryName', () => {
        test('Should format a string to camelCase', async function () {
            expect(getGraphqlQueryNameFromLibraryName('not camel_case string!')).toEqual('notCamelCaseString');
            expect(getGraphqlQueryNameFromLibraryName('Users & Groups')).toEqual('usersGroups');
            expect(getGraphqlQueryNameFromLibraryName('lot       of      space!!!')).toEqual('lotOfSpace');
        });
    });

    describe('getGraphqlTypeFromLibraryName', () => {
        test('Should format a string to CamelCase, upper first with no trailing "s"', async function () {
            expect(getGraphqlTypeFromLibraryName('not camel_case string!')).toEqual('NotCamelCaseString');
            expect(getGraphqlTypeFromLibraryName('Users & Groups')).toEqual('UsersGroup');
            expect(getGraphqlTypeFromLibraryName('lot       of      space!!!')).toEqual('LotOfSpace');
        });
    });

    describe('localizedTranslation', () => {
        test('Return label based on user language', async () => {
            expect(localizedTranslation({fr: 'français', en: 'english'}, ['fr'])).toBe('français');
            expect(localizedTranslation({en: 'english', es: 'español'}, ['fr', 'en'])).toBe('english');
            expect(localizedTranslation({en: 'english', es: 'español'}, ['pt', 'cz'])).toBe('english');
        });
    });

    describe('stringToColor', () => {
        const str = 'mytest';
        test('gets the same color if called twice', () => {
            const res1 = stringToColor(str);
            const res2 = stringToColor(str);
            expect(res1).toEqual(res2);
        });
        test('gets hsl by default', () => {
            const res = stringToColor(str);
            expect(res).toMatch(/hsl\(-?(\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g);
        });
        test('gets rgb if specified', () => {
            const res = stringToColor(str, 'rgb');
            expect(res).toMatch(/rgb\((\d+),\s*([\d]+),\s*([\d]+)\)/g);
        });
        test('gets hex if specified', () => {
            const res = stringToColor(str, 'hex');
            expect(res).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
        test('handle null string', () => {
            const res = stringToColor(null, 'hex');
            expect(res).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
    });

    describe('getInvertColor', () => {
        test('Return opposite color', async () => {
            expect(getInvertColor('#000000')).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect(getInvertColor('#000000')).toBe('#FFFFFF');
            expect(getInvertColor('#701518')).toBe('#FFFFFF');
            expect(getInvertColor('#252525')).toBe('#FFFFFF');
            expect(getInvertColor('#D51558')).toBe('#FFFFFF');
            expect(getInvertColor('#FFFFFF')).toBe('#000000');
            expect(getInvertColor('#E0E1E2')).toBe('#000000');
            expect(getInvertColor('#F6F6F6')).toBe('#000000');
            expect(getInvertColor('#B7BFC7')).toBe('#000000');
        });
    });

    describe('extractArgsFromString', () => {
        test('Extract args', async () => {
            expect(extractArgsFromString('-library product -type link -key')).toEqual({
                library: 'product',
                type: 'link',
                key: true
            });

            expect(extractArgsFromString('-library product -type link -library users -answer 42')).toEqual({
                type: 'link',
                library: 'users',
                answer: '42'
            });
        });
    });

    describe('objectToNameValueArray', () => {
        test('Convert object to name/value array', async () => {
            expect(objectToNameValueArray({a: 'b', c: 'd'})).toEqual([
                {name: 'a', value: 'b'},
                {name: 'c', value: 'd'}
            ]);
        });
    });

    describe('nameValArrayToObj', () => {
        test('Convert name/value array to object', async () => {
            expect(
                nameValArrayToObj([
                    {name: 'a', value: 'b'},
                    {name: 'c', value: 'd'}
                ])
            ).toEqual({
                a: 'b',
                c: 'd'
            });

            expect(
                nameValArrayToObj(
                    [
                        {foo: 'a', bar: 'b'},
                        {foo: 'c', bar: 'd'}
                    ],
                    'foo',
                    'bar'
                )
            ).toEqual({
                a: 'b',
                c: 'd'
            });
        });
    });

    describe('getFileType', () => {
        test('Return file type from extension', async () => {
            expect(getFileType('file.txt')).toBe(FileType.OTHER);
            expect(getFileType('file')).toBe(FileType.OTHER);
            expect(getFileType('file.jpg')).toBe(FileType.IMAGE);
            expect(getFileType('file.old.jpg')).toBe(FileType.IMAGE);
            expect(getFileType('file.mp4')).toBe(FileType.VIDEO);
            expect(getFileType('file.pdf')).toBe(FileType.DOCUMENT);
        });
    });

    describe('getCallStack', () => {
        test('Return call stack', async () => {
            // It would be hazardous to check the real stack as it might break on any change in jest internals.
            // Just check we have something in the stack
            expect(getCallStack().length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('getInitials', () => {
        test('Return label initials for given length', async () => {
            expect(getInitials('', 2)).toBe('?');
            expect(getInitials('    ', 2)).toBe('?');
            expect(getInitials('Foo Bar', 0)).toBe('?');
            expect(getInitials('Foo Bar', -1)).toBe('?');
            expect(getInitials('Foo', 1)).toBe('F');
            expect(getInitials('Foo', 2)).toBe('FO');
            expect(getInitials('Foo', 4)).toBe('FOO');
            expect(getInitials('Foo Bar', 1)).toBe('F');
            expect(getInitials('Foo Bar', 2)).toBe('FB');
            expect(getInitials('Foo - Bar', 2)).toBe('FB');
            expect(getInitials('Foo & Bar', 2)).toBe('FB');
            expect(getInitials('- Foo - Bar', 2)).toBe('FB');
            expect(getInitials('- Foo -', 2)).toBe('FO');
            expect(getInitials('123 Foo', 2)).toBe('FO');
            expect(getInitials('132 - Foo Bar', 2)).toBe('FB');
            expect(getInitials('987 & 654 -23_AB', 2)).toBe('AB');
            expect(getInitials('987654', 2)).toBe('98');
            expect(getInitials('987 - 654', 2)).toBe('96');
            expect(getInitials('987 - aaaa', 4)).toBe('AAAA');
            expect(getInitials('^ - ^456789', 6)).toBe('456789');
            expect(getInitials('^ - ^456789', 7)).toBe('456789');
            expect(getInitials('987 - 654', 1)).toBe('9');
            expect(getInitials('^ - ^', 2)).toBe('^-');
            expect(getInitials('Amélie Poulain', 2)).toBe('AP');
            expect(getInitials('Amé&-lie Poulain', 2)).toBe('AP');
        });
    });

    describe('slugifyString', () => {
        test('Return slugified string', async () => {
            expect(slugifyString('123456789')).toBe('123456789');
            expect(slugifyString('foo')).toBe('foo');
            expect(slugifyString('foo_bar')).toBe('foo_bar');
            expect(slugifyString('My ID')).toBe('my_id');
            expect(slugifyString('Méh bàèrùçû')).toBe('meh_baerucu');
            expect(slugifyString('Foo-bar')).toBe('foo_bar');
            expect(slugifyString('   foo   ')).toBe('foo');
            expect(slugifyString('foo bar')).toBe('foo_bar');
            expect(slugifyString('foo   bar')).toBe('foo_bar');
            expect(slugifyString('foo   ')).toBe('foo');
            expect(slugifyString('foo^$$bar')).toBe('foo_bar');
            expect(slugifyString('foo_bar99')).toBe('foo_bar99');
            expect(slugifyString('# my string-not"  ok\'!  ')).toBe('my_string_not_ok');
        });
    });

    describe('omit', () => {
        test('Should omit specified keys from an object', () => {
            const obj = {a: 1, b: 2, c: 3};
            const result = omit(obj, 'a', 'c');
            expect(result).toEqual({b: 2});
        });

        test('Should return a new object without modifying the original object', () => {
            const obj = {a: 1, b: 2, c: 3};
            const result = omit(obj, 'a', 'c');
            expect(result).toEqual({b: 2});
            expect(obj).toEqual({a: 1, b: 2, c: 3});
        });

        test('Should handle omitting all keys', () => {
            const obj = {a: 1, b: 2, c: 3};
            const result = omit(obj, 'a', 'b', 'c');
            expect(result).toEqual({});
        });

        test('Should handle omitting keys of different types', () => {
            const obj = {a: 1, b: 'two', c: true};
            const result = omit(obj, 'a', 'b');
            expect(result).toEqual({c: true});
        });
    });
});
