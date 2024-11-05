// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {i18n} from 'i18next';

export const mockTranslator: Mockify<i18n> = {
    t: jest.fn(s => s)
};

export const mockTranslatorWithOptions: Mockify<i18n> = {
    t: jest.fn((key, options) => 'not implemented!')
};
