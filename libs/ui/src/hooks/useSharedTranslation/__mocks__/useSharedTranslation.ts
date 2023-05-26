import {Mockify} from '@leav/utils';
import {TFunction, i18n} from 'i18next';

const mockI18n: Mockify<i18n> = {
    language: 'fr',
    options: {
        fallbackLng: ['en']
    },
    changeLanguage: jest.fn()
};

const mockT = (arg, variables) => `${[arg, ...(!!variables ? Object.values(variables) : [])].join('|')}`;

export default () => {
    const mock = {t: mockT as TFunction<any>, i18n: mockI18n as i18n, ready: true};

    return mock;
};
