import {i18n} from 'i18next';
import {Mockify} from 'src/_types/Mockify';
import {addWildcardToFilters, formatIDString, localizedLabel} from './utils';

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
});
