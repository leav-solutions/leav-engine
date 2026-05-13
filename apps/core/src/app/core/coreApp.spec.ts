import {type ToAny} from '../../utils/utils';
import coreApp, {type ICoreAppDeps} from './coreApp';

const depsBase: ToAny<ICoreAppDeps> = {
    'core.domain.core': vi.fn(),
    'core.domain.eventsManager': vi.fn(),
    'core.app.graphql.customScalars.systemTranslation': vi.fn(),
    'core.app.graphql.customScalars.dateTime': vi.fn(),
    'core.app.graphql.customScalars.any': vi.fn(),
    config: {},
    translator: {},
};

describe('coreApp', () => {
    describe('filterSysTranslationField', () => {
        const fieldData = {
            fr: 'labelFR',
            en: 'labelEN',
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
