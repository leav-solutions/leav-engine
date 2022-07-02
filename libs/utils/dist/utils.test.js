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
            expect(utils_1.getGraphqlQueryNameFromLibraryName('not camel_case string!')).toEqual('notCamelCaseString');
            expect(utils_1.getGraphqlQueryNameFromLibraryName('Users & Groups')).toEqual('usersGroups');
            expect(utils_1.getGraphqlQueryNameFromLibraryName('lot       of      space!!!')).toEqual('lotOfSpace');
        });
    });
    describe('getGraphqlTypeFromLibraryName', () => {
        test('Should format a string to CamelCase, upper first with no trailing "s"', async function () {
            expect(utils_1.getGraphqlTypeFromLibraryName('not camel_case string!')).toEqual('NotCamelCaseString');
            expect(utils_1.getGraphqlTypeFromLibraryName('Users & Groups')).toEqual('UsersGroup');
            expect(utils_1.getGraphqlTypeFromLibraryName('lot       of      space!!!')).toEqual('LotOfSpace');
        });
    });
    describe('localizedTranslation', () => {
        test('Return label based on user language', async () => {
            expect(utils_1.localizedTranslation({ fr: 'français', en: 'english' }, ['fr'])).toBe('français');
            expect(utils_1.localizedTranslation({ en: 'english', es: 'español' }, ['fr', 'en'])).toBe('english');
            expect(utils_1.localizedTranslation({ en: 'english', es: 'español' }, ['pt', 'cz'])).toBe('english');
        });
    });
    describe('stringToColor', () => {
        const str = 'mytest';
        test('gets the same color if called twice', () => {
            const res1 = utils_1.stringToColor(str);
            const res2 = utils_1.stringToColor(str);
            expect(res1).toEqual(res2);
        });
        test('gets hsl by default', () => {
            const res = utils_1.stringToColor(str);
            expect(res).toMatch(/hsl\(-?(\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g);
        });
        test('gets rgb if specified', () => {
            const res = utils_1.stringToColor(str, 'rgb');
            expect(res).toMatch(/rgb\((\d+),\s*([\d]+),\s*([\d]+)\)/g);
        });
        test('gets hex if specified', () => {
            const res = utils_1.stringToColor(str, 'hex');
            expect(res).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
    });
    describe('getInvertColor', () => {
        test('Return opposite color', async () => {
            expect(utils_1.getInvertColor('#000000')).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect(utils_1.getInvertColor('#000000')).toBe('#FFFFFF');
            expect(utils_1.getInvertColor('#701518')).toBe('#FFFFFF');
            expect(utils_1.getInvertColor('#252525')).toBe('#FFFFFF');
            expect(utils_1.getInvertColor('#D51558')).toBe('#FFFFFF');
            expect(utils_1.getInvertColor('#FFFFFF')).toBe('#000000');
            expect(utils_1.getInvertColor('#E0E1E2')).toBe('#000000');
            expect(utils_1.getInvertColor('#F6F6F6')).toBe('#000000');
            expect(utils_1.getInvertColor('#B7BFC7')).toBe('#000000');
        });
    });
    describe('extractArgsFromString', () => {
        test('Extract args', async () => {
            expect(utils_1.extractArgsFromString('-library product -type link -key')).toEqual({
                library: 'product',
                type: 'link',
                key: true
            });
            expect(utils_1.extractArgsFromString('-library product -type link -library users -answer 42')).toEqual({
                type: 'link',
                library: 'users',
                answer: '42'
            });
        });
    });
    describe('objectToNameValueArray', () => {
        test('Convert object to name/value array', async () => {
            expect(utils_1.objectToNameValueArray({ a: 'b', c: 'd' })).toEqual([
                { name: 'a', value: 'b' },
                { name: 'c', value: 'd' }
            ]);
        });
    });
    describe('getLibraryGraphqlNames', () => {
        test('Return graphql types', async () => {
            const res = utils_1.getLibraryGraphqlNames('some_records');
            expect(res.query).toBe('someRecords');
            expect(res.type).toBe('SomeRecord');
            expect(res.list).toBe('SomeRecordList');
            expect(res.searchableFields).toBe('SomeRecordSearchableFields');
            expect(res.filter).toBe('SomeRecordFilter');
        });
    });
    describe('getFileType', () => {
        test('Return file type from extension', async () => {
            expect(utils_1.getFileType('file.txt')).toBe(files_1.FileType.OTHER);
            expect(utils_1.getFileType('file')).toBe(files_1.FileType.OTHER);
            expect(utils_1.getFileType('file.jpg')).toBe(files_1.FileType.IMAGE);
            expect(utils_1.getFileType('file.old.jpg')).toBe(files_1.FileType.IMAGE);
            expect(utils_1.getFileType('file.mp4')).toBe(files_1.FileType.VIDEO);
            expect(utils_1.getFileType('file.pdf')).toBe(files_1.FileType.DOCUMENT);
        });
    });
});
//# sourceMappingURL=utils.test.js.map