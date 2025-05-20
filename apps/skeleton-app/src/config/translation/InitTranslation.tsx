// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useState} from 'react';
import {LangContext, Loading, useAppLang as useGetDefaultLang} from '@leav/ui';
import {initI18n, i18n} from './initI18n';
import {useGetLanguagesQuery} from '../../__generated__';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import {getLanguageRadical, userLanguage} from './utils';

export const InitTranslation: FunctionComponent = ({children}) => {
    const {data: availableLangs, loading: langsLoading, error: langsError} = useGetLanguagesQuery();
    const {lang, loading, error} = useGetDefaultLang();

    const [i18nIsInitialized, setI18nIsInitialized] = useState(false);

    const [language, setLanguage] = useState<null | [currentLng: string, fallbackLng: string]>(null);

    const _handleLanguageChange = (newLang: string): void => {
        i18n.changeLanguage(newLang).then(() => {
            setLanguage(([, fallbackLng]) => [newLang, fallbackLng]);
        });
    };

    useEffect(() => {
        if (!i18nIsInitialized && lang && availableLangs) {
            const userLang = availableLangs.langs.includes(userLanguage) ? userLanguage : getLanguageRadical(lang);
            initI18n(userLang).then(() => {
                setI18nIsInitialized(true);
                dayjs.locale(userLang);
                const fallbackLng = lang;
                setLanguage([userLang, fallbackLng]);
            });
        }
    }, [lang, availableLangs]);

    if (error) {
        throw error;
    }

    if (langsError) {
        throw langsError;
    }

    return loading || !i18nIsInitialized || langsLoading ? (
        <Loading />
    ) : (
        <LangContext.Provider
            value={{
                lang: language,
                availableLangs: availableLangs.langs,
                defaultLang: lang,
                setLang: _handleLanguageChange
            }}
        >
            {children}
        </LangContext.Provider>
    );
};
