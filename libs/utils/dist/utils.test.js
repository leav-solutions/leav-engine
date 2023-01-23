"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const files_1 = require("./types/files");
const utils_1 = require("./utils");
describe('utils', () => {
    describe('getGraphqlQueryNameFromLibraryName', () => {
        test('Should format a string to camelCase', async function () {
            expect((0, utils_1.getGraphqlQueryNameFromLibraryName)('not camel_case string!')).toEqual('notCamelCaseString');
            expect((0, utils_1.getGraphqlQueryNameFromLibraryName)('Users & Groups')).toEqual('usersGroups');
            expect((0, utils_1.getGraphqlQueryNameFromLibraryName)('lot       of      space!!!')).toEqual('lotOfSpace');
        });
    });
    describe('getGraphqlTypeFromLibraryName', () => {
        test('Should format a string to CamelCase, upper first with no trailing "s"', async function () {
            expect((0, utils_1.getGraphqlTypeFromLibraryName)('not camel_case string!')).toEqual('NotCamelCaseString');
            expect((0, utils_1.getGraphqlTypeFromLibraryName)('Users & Groups')).toEqual('UsersGroup');
            expect((0, utils_1.getGraphqlTypeFromLibraryName)('lot       of      space!!!')).toEqual('LotOfSpace');
        });
    });
    describe('localizedTranslation', () => {
        test('Return label based on user language', async () => {
            expect((0, utils_1.localizedTranslation)({ fr: 'français', en: 'english' }, ['fr'])).toBe('français');
            expect((0, utils_1.localizedTranslation)({ en: 'english', es: 'español' }, ['fr', 'en'])).toBe('english');
            expect((0, utils_1.localizedTranslation)({ en: 'english', es: 'español' }, ['pt', 'cz'])).toBe('english');
        });
    });
    describe('stringToColor', () => {
        const str = 'mytest';
        test('gets the same color if called twice', () => {
            const res1 = (0, utils_1.stringToColor)(str);
            const res2 = (0, utils_1.stringToColor)(str);
            expect(res1).toEqual(res2);
        });
        test('gets hsl by default', () => {
            const res = (0, utils_1.stringToColor)(str);
            expect(res).toMatch(/hsl\(-?(\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g);
        });
        test('gets rgb if specified', () => {
            const res = (0, utils_1.stringToColor)(str, 'rgb');
            expect(res).toMatch(/rgb\((\d+),\s*([\d]+),\s*([\d]+)\)/g);
        });
        test('gets hex if specified', () => {
            const res = (0, utils_1.stringToColor)(str, 'hex');
            expect(res).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
    });
    describe('getInvertColor', () => {
        test('Return opposite color', async () => {
            expect((0, utils_1.getInvertColor)('#000000')).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect((0, utils_1.getInvertColor)('#000000')).toBe('#FFFFFF');
            expect((0, utils_1.getInvertColor)('#701518')).toBe('#FFFFFF');
            expect((0, utils_1.getInvertColor)('#252525')).toBe('#FFFFFF');
            expect((0, utils_1.getInvertColor)('#D51558')).toBe('#FFFFFF');
            expect((0, utils_1.getInvertColor)('#FFFFFF')).toBe('#000000');
            expect((0, utils_1.getInvertColor)('#E0E1E2')).toBe('#000000');
            expect((0, utils_1.getInvertColor)('#F6F6F6')).toBe('#000000');
            expect((0, utils_1.getInvertColor)('#B7BFC7')).toBe('#000000');
        });
    });
    describe('extractArgsFromString', () => {
        test('Extract args', async () => {
            expect((0, utils_1.extractArgsFromString)('-library product -type link -key')).toEqual({
                library: 'product',
                type: 'link',
                key: true
            });
            expect((0, utils_1.extractArgsFromString)('-library product -type link -library users -answer 42')).toEqual({
                type: 'link',
                library: 'users',
                answer: '42'
            });
        });
    });
    describe('objectToNameValueArray', () => {
        test('Convert object to name/value array', async () => {
            expect((0, utils_1.objectToNameValueArray)({ a: 'b', c: 'd' })).toEqual([
                { name: 'a', value: 'b' },
                { name: 'c', value: 'd' }
            ]);
        });
    });
    describe('nameValArrayToObj', () => {
        test('Convert name/value array to object', async () => {
            expect((0, utils_1.nameValArrayToObj)([
                { name: 'a', value: 'b' },
                { name: 'c', value: 'd' }
            ])).toEqual({
                a: 'b',
                c: 'd'
            });
            expect((0, utils_1.nameValArrayToObj)([
                { foo: 'a', bar: 'b' },
                { foo: 'c', bar: 'd' }
            ], 'foo', 'bar')).toEqual({
                a: 'b',
                c: 'd'
            });
        });
    });
    describe('getLibraryGraphqlNames', () => {
        test('Return graphql types', async () => {
            const res = (0, utils_1.getLibraryGraphqlNames)('some_records');
            expect(res.query).toBe('someRecords');
            expect(res.type).toBe('SomeRecord');
            expect(res.list).toBe('SomeRecordList');
            expect(res.searchableFields).toBe('SomeRecordSearchableFields');
            expect(res.filter).toBe('SomeRecordFilter');
        });
    });
    describe('getFileType', () => {
        test('Return file type from extension', async () => {
            expect((0, utils_1.getFileType)('file.txt')).toBe(files_1.FileType.OTHER);
            expect((0, utils_1.getFileType)('file')).toBe(files_1.FileType.OTHER);
            expect((0, utils_1.getFileType)('file.jpg')).toBe(files_1.FileType.IMAGE);
            expect((0, utils_1.getFileType)('file.old.jpg')).toBe(files_1.FileType.IMAGE);
            expect((0, utils_1.getFileType)('file.mp4')).toBe(files_1.FileType.VIDEO);
            expect((0, utils_1.getFileType)('file.pdf')).toBe(files_1.FileType.DOCUMENT);
        });
    });
    describe('getCallStack', () => {
        test('Return call stack', async () => {
            // It would be hazardous to check the real stack as it might break on any change in jest internals.
            // Just check we have something in the stack
            expect((0, utils_1.getCallStack)().length).toBeGreaterThanOrEqual(1);
        });
    });
    describe('getInitials', () => {
        test('Return label initials for given length', async () => {
            expect((0, utils_1.getInitials)('Dwight Schrute', 2)).toBe('DS');
            expect((0, utils_1.getInitials)('Dwight Schrute', 1)).toBe('D');
            expect((0, utils_1.getInitials)('Dwight', 2)).toBe('DW');
        });
    });
});
//# sourceMappingURL=utils.test.js.map