import React from 'react';
import LangContext from '../../components/shared/LangContext';
import {AvailableLanguage} from '../../_gqlTypes/globalTypes';

function MockedLangContextProvider({children}) {
    return <LangContext.Provider value={{lang: [AvailableLanguage.fr]}}>{children}</LangContext.Provider>;
}

export default MockedLangContextProvider;
