// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILangContext, LangContext} from '@leav/ui';
import {type FunctionComponent, type PropsWithChildren} from 'react';
import {useTranslation} from 'react-i18next';
import {defaultLanguage, supportedLanguages} from './translationConstants';

export const LanguageProvider: FunctionComponent<PropsWithChildren<{}>> = ({children}) => {
    const {i18n} = useTranslation();

    const langContext: ILangContext = {
        lang: [i18n.language],
        availableLangs: supportedLanguages.map(({language}) => language),
        defaultLang: defaultLanguage.language,
        setLang: i18n.changeLanguage
    };
    return <LangContext.Provider value={langContext}>{children}</LangContext.Provider>;
};
