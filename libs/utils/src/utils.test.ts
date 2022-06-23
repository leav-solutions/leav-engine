// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    extractArgsFromString,
    getGraphqlQueryNameFromLibraryName,
    getGraphqlTypeFromLibraryName,
    getInvertColor,
    localizedTranslation,
    objectToNameValueArray,
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
});
