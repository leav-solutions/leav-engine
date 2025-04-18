// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {LangContext, ILangContext} from '@leav/ui';
import {AvailableLanguage} from '../../_types/types';

function MockedLangContextProvider({children}) {
    const mockLangs: ILangContext = {
        lang: [AvailableLanguage.fr],
        availableLangs: [AvailableLanguage.fr, AvailableLanguage.en],
        defaultLang: AvailableLanguage.fr,
        setLang: jest.fn()
    };

    return <LangContext.Provider value={mockLangs}>{children}</LangContext.Provider>;
}

export default MockedLangContextProvider;
