import {i18n} from 'i18next';
import {Mockify} from 'src/_types/Mockify';
import {localizedLabel} from './utils';

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
});
