import React from 'react';
import {AvailableLanguage} from '../../../_gqlTypes/globalTypes';

export interface ILangContext {
    lang: AvailableLanguage[];
    availableLangs: AvailableLanguage[];
    defaultLang: AvailableLanguage;
}

/* tslint:disable-next-line:variable-name */
const LangContext = React.createContext<ILangContext | null>(null);

export default LangContext;
