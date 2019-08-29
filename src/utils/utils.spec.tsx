import {i18n} from 'i18next';
import {TreeNode} from 'react-sortable-tree';
import {PermissionsActions} from '../_gqlTypes/globalTypes';
import {IS_ALLOWED_isAllowed} from '../_gqlTypes/IS_ALLOWED';
import {Mockify} from '../_types//Mockify';
import {
    addWildcardToFilters,
    formatIDString,
    getFieldError,
    getInvertColor,
    getRandomColor,
    getTreeNodeKey,
    localizedLabel,
    permsArrayToObject
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
            const label = localizedLabel({fr: 'LabelFR', en: 'LabelEN'}, mockI18n as i18n);
            expect(label).toEqual('LabelFR');
        });

        test('Return fallback lang label when user lang empty', async () => {
            const label = localizedLabel({fr: '', en: 'LabelEN'}, mockI18n as i18n);
            expect(label).toEqual('LabelEN');
        });

        test('Return fallback lang label when user lang absent', async () => {
            const label = localizedLabel({en: 'LabelEN'}, mockI18n as i18n);
            expect(label).toEqual('LabelEN');
        });

        test('Return first label found if nothing matches language settings', async () => {
            const label = localizedLabel({es: 'LabelES', ru: 'LabelRU'}, mockI18n as i18n);
            expect(label).toEqual('LabelES');
        });

        test('Return empty string if no labels', async () => {
            const label = localizedLabel(null, mockI18n as i18n);
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
});
