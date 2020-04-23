import React from 'react';
import {AvailableLanguage} from '../../../_gqlTypes/globalTypes';

export interface ILangContext {
    lang: AvailableLanguage[];
    availableLangs: AvailableLanguage[];
    defaultLang: AvailableLanguage;
}

const LangContext = React.createContext<ILangContext | null>(null);

export default LangContext;
