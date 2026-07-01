import {type Mockify} from '_ui/__mocks__/utils';
import {type TFunction, type i18n} from 'i18next';
import {vi} from 'vitest';

const mockI18n: Mockify<i18n> = {
    language: 'fr',
    options: {
        fallbackLng: ['en'],
    },
    changeLanguage: vi.fn(),
};

const mockT = (arg, variables) => `${[arg, ...(!!variables ? Object.values(variables) : [])].join('|')}`;

export default () => {
    const mock = {t: mockT as TFunction<any>, i18n: mockI18n as i18n, ready: true};

    return mock;
};
