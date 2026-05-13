import {type i18n} from 'i18next';

export const mockTranslator: Mockify<i18n> = {
    t: vi.fn(s => s),
};

export const mockTranslatorWithOptions: Mockify<i18n> = {
    t: vi.fn((key, options) => 'not implemented!'),
};
