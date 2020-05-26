import React from 'react';
import LangContext from '../../components/shared/LangContext';
import {ILangContext} from '../../components/shared/LangContext/LangContext';
import {AvailableLanguage} from '../../_types/types';

function MockedLangContextProvider({children}: any) {
    const mockLangs: ILangContext = {
        lang: [AvailableLanguage.fr],
        availableLangs: [AvailableLanguage.fr, AvailableLanguage.en],
        defaultLang: AvailableLanguage.fr
    };

    return <LangContext.Provider value={mockLangs}>{children}</LangContext.Provider>;
}

export default MockedLangContextProvider;
