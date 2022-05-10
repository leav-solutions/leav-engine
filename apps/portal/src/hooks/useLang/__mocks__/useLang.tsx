// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {ILangContext} from 'context/LangContext/LangContext';

export const mockLangContext: ILangContext = {
    lang: ['fr', 'en'],
    availableLangs: ['fr', 'en'],
    defaultLang: 'fr',
    setLang: jest.fn()
};

const mockUseLang = (): ILangContext => {
    return mockLangContext;
};

export default mockUseLang;
