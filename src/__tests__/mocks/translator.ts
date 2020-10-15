import {i18n} from 'i18next';

export const mockTranslator: Mockify<i18n> = {
    t: jest.fn(s => s)
};
