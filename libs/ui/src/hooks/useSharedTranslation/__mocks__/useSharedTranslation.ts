// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
