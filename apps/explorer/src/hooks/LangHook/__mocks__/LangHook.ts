// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {UseLangValue} from '../LangHook';

const mockUseLang: UseLangValue = [{lang: ['fr', 'FR'], availableLangs: ['fr', 'en'], defaultLang: 'fr'}, jest.fn()];

export const useLang = (): UseLangValue => {
    return mockUseLang;
};
