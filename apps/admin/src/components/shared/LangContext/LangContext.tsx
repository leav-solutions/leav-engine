import React from 'react';
import {type AvailableLanguage} from '../../../_gqlTypes';

export interface ILangContext {
    lang: AvailableLanguage[];
    availableLangs: AvailableLanguage[];
    defaultLang: AvailableLanguage;
    setLang: (lang: AvailableLanguage[]) => void;
}

const LangContext = React.createContext<ILangContext | null>(null);

export default LangContext;
