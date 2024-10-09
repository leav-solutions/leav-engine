// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ToAny} from 'utils/utils';
import coreApp, {IDeps} from './coreApp';

const depsBase: ToAny<IDeps> = {
    'core.domain.core': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.app.graphql': jest.fn(),
    'core.app.graphql.customScalars.systemTranslation': jest.fn(),
    'core.app.graphql.customScalars.dateTime': jest.fn(),
    'core.app.graphql.customScalars.any': jest.fn(),
    config: {},
    translator: {}
};

describe('coreApp', () => {
    describe('filterSysTranslationField', () => {
        const fieldData = {
            fr: 'labelFR',
            en: 'labelEN'
        };
        test('Return filtered label', async () => {
            const requestedLangs = ['fr'];

            const app = coreApp(depsBase);

            const label = app.filterSysTranslationField(fieldData, requestedLangs)!;
            expect(label.fr).toEqual('labelFR');
            expect(label.en).toBeUndefined();
        });

        test('Return all languages if no filter provided', async () => {
            const requestedLangs = [];

            const app = coreApp(depsBase);

            const label = app.filterSysTranslationField(fieldData, requestedLangs);

            expect(label).toMatchObject(fieldData);
        });
    });
});
