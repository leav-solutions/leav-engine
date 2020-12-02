// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import LangContext from '../../components/shared/LangContext';
import {ILangContext} from '../../components/shared/LangContext/LangContext';
import {AvailableLanguage} from '../../_gqlTypes/globalTypes';

function MockedLangContextProvider({children}) {
    const mockLangs: ILangContext = {
        lang: [AvailableLanguage.fr],
        availableLangs: [AvailableLanguage.fr, AvailableLanguage.en],
        defaultLang: AvailableLanguage.fr
    };

    return <LangContext.Provider value={mockLangs}>{children}</LangContext.Provider>;
}

export default MockedLangContextProvider;
