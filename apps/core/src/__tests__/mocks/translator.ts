// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {i18n} from 'i18next';

export const mockTranslator: Mockify<i18n> = {
    t: jest.fn(s => s)
};
