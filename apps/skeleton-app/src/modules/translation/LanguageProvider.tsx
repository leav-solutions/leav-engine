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
