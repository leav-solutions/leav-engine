// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {AvailableLanguage} from '../../../_gqlTypes/globalTypes';

export interface ILangContext {
    lang: AvailableLanguage[];
    availableLangs: AvailableLanguage[];
    defaultLang: AvailableLanguage;
    setLang: (lang: AvailableLanguage[]) => void;
}

const LangContext = React.createContext<ILangContext | null>(null);

export default LangContext;
