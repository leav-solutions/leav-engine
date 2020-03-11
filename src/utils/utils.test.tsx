import {i18n} from 'i18next';
import {TreeNode} from 'react-sortable-tree';
import {PermissionsActions} from '../_gqlTypes/globalTypes';
import {IS_ALLOWED_isAllowed} from '../_gqlTypes/IS_ALLOWED';
import {Mockify} from '../_types/Mockify';
import {mockAttrAdv, mockAttrAdvLink, mockAttrSimpleLink, mockAttrTree} from '../__mocks__/attributes';
import {
    addWildcardToFilters,
    formatIDString,
    getFieldError,
    getInvertColor,
    getRandomColor,
    getRecordIdentityCacheKey,
    getSysTranslationQueryLanguage,
    getTreeNodeKey,
    isLinkAttribute,
    localizedLabel,
    permsArrayToObject,
    stringToColor,
    versionObjToGraphql
} from './utils';

describe('utils', () => {
    describe('localizedLabel', () => {
        const mockI18n: Mockify<i18n> = {
            language: 'fr',
            options: {
                fallbackLng: ['en']
            }
        };

        test('Return user lang label', async () => {
            const availableLanguages = getSysTranslationQueryLanguage(mockI18n as i18n);
            const label = localizedLabel({fr: 'LabelFR', en: 'LabelEN'}, availableLanguages);
            expect(label).toEqual('LabelFR');
        });

        test('Return fallback lang label when user lang empty', async () => {
            const availableLanguages = getSysTranslationQueryLanguage(mockI18n as i18n);
            const label = localizedLabel({fr: '', en: 'LabelEN'}, availableLanguages);
            expect(label).toEqual('LabelEN');
        });

        test('Return fallback lang label when user lang absent', async () => {
            const availableLanguages = getSysTranslationQueryLanguage(mockI18n as i18n);
            const label = localizedLabel({en: 'LabelEN'}, availableLanguages);
            expect(label).toEqual('LabelEN');
        });

        test('Return first label found if nothing matches language settings', async () => {
            const availableLanguages = getSysTranslationQueryLanguage(mockI18n as i18n);
            const label = localizedLabel({es: 'LabelES', ru: 'LabelRU'}, availableLanguages);
            expect(label).toEqual('LabelES');
        });

        test('Return empty string if no labels', async () => {
            const availableLanguages = getSysTranslationQueryLanguage(mockI18n as i18n);
            const label = localizedLabel(null, availableLanguages);
            expect(label).toEqual('');
        });
    });

    describe('formatIDString', () => {
        test('Replace spaces and all ponctuation with underscores', async () => {
            const s = ' my string-not"  ok\'!  ';

            expect(formatIDString(s)).toEqual('my_string_not_ok');
        });

        test('Convert to lower case', async () => {
            const s = 'MyStrinG';

            expect(formatIDString(s)).toEqual('mystring');
        });

        test('Remove accents and all special chars', async () => {
            const s = 'machaïneaccentuée';

            expect(formatIDString(s)).toEqual('machaineaccentuee');
        });
    });

    describe('addWildcardToFilters', () => {
        const filters = {
            label: 'test',
            id: 'test',
            otherKey: 'otherTest'
        };

        test('Add wildcards to defaults keys', async () => {
            const wildcardedFilters: any = addWildcardToFilters(filters);

            expect(wildcardedFilters.label).toEqual('%test%');
            expect(wildcardedFilters.id).toEqual('%test%');
            expect(wildcardedFilters.otherKey).toEqual('otherTest');
        });

        test('Add wildcards to defined keys', async () => {
            const wildcardedFilters: any = addWildcardToFilters(filters, ['id', 'otherKey']);

            expect(wildcardedFilters.label).toEqual('test');
            expect(wildcardedFilters.id).toEqual('%test%');
            expect(wildcardedFilters.otherKey).toEqual('%otherTest%');
        });
    });

    describe('getRandomColor', () => {
        test('Generate random hexadecimal color', async () => {
            expect(getRandomColor()).toMatch(/^\#[0-9A-Fa-f]{6}$/);
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
            expect(res).toMatch(/^\#[0-9A-Fa-f]{6}$/);
        });
    });

    describe('getInvertColor', () => {
        test('Return opposite color', async () => {
            expect(getInvertColor('#000000')).toMatch(/^\#[0-9A-Fa-f]{6}$/);
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

    describe('getNodeKey', () => {
        test('Return key', async () => {
            const nodeData: TreeNode = {
                node: {
                    id: 12345,
                    library: {
                        id: 'test_lib'
                    }
                }
            };

            expect(getTreeNodeKey(nodeData)).toBe('test_lib/12345');
        });

        test('Return empty key if no node', async () => {
            expect(getTreeNodeKey(null)).toBe('');
        });
    });

    describe('permsArrayToObject', () => {
        test('Converts an array of permissions to an object', async () => {
            const perms: IS_ALLOWED_isAllowed[] = [
                {
                    name: PermissionsActions.access,
                    allowed: true
                },
                {
                    name: PermissionsActions.edit,
                    allowed: false
                }
            ];

            expect(permsArrayToObject(perms)).toEqual({
                access: true,
                edit: false
            });
        });
    });

    describe('getFieldError', () => {
        test('Return server error', async () => {
            const res = getFieldError('my_field', {my_field: false}, {my_field: 'ERROR'}, {});

            expect(res).toBe('ERROR');
        });
        test('Return field error', async () => {
            const res = getFieldError('my_field', {my_field: true}, {}, {my_field: 'ERROR'});

            expect(res).toBe('ERROR');
        });
        test("Return no error if field hasn't been touched", async () => {
            const res = getFieldError('my_field', {my_field: false}, {}, {my_field: 'ERROR'});

            expect(res).toBe('');
        });
    });

    describe('versionObjToGraphql', () => {
        test('Convert a version object to graphql array', async () => {
            const res = versionObjToGraphql({
                regions: {library: 'regions', id: '13586077'},
                lang: {library: 'lang', id: '12345'}
            });

            expect(res).toStrictEqual([
                {name: 'regions', value: {library: 'regions', id: '13586077'}},
                {name: 'lang', value: {library: 'lang', id: '12345'}}
            ]);
        });
    });

    describe('isLinkAttribute', () => {
        test('Check if is link attribute', async () => {
            expect(isLinkAttribute(mockAttrAdv)).toBe(false);
            expect(isLinkAttribute(mockAttrTree)).toBe(false);
            expect(isLinkAttribute(mockAttrAdvLink)).toBe(true);
            expect(isLinkAttribute(mockAttrSimpleLink)).toBe(true);
        });

        test('Include type tree if non-strict mode', async () => {
            expect(isLinkAttribute(mockAttrTree, false)).toBe(true);
        });
    });

    describe('getRecordIdentityCacheKey', () => {
        test('Return cache key based on lib and id', async () => {
            expect(getRecordIdentityCacheKey('test_lib', '12345')).toBe('recordIdentity/test_lib/12345');
        });
    });
});
