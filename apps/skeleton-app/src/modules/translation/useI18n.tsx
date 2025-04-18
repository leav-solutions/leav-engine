// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';
import {LeavServerError} from './LeavServerError';
import {getLeavFallbackLanguage} from './translationService';
import {defaultLanguage, supportedLanguages} from './translationConstants';
import {initI18n} from './initI18n';

const LOCAL_STORAGE_LANG_KEY = 'i18nextLng';

type UseI18n = () => {error: string | null; loading: boolean};

export const getLanguageRadical = (language: string) => language?.split('-')[0];
const isSupportedLanguage = (language: string) =>
    supportedLanguages.some(supportedLanguage => supportedLanguage.language === language);

const userLanguage = getLanguageRadical(localStorage.getItem(LOCAL_STORAGE_LANG_KEY) || navigator.language);

export const useI18n: UseI18n = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getLeavFallbackLanguage()
            .then(fallbackLanguage => initI18n(fallbackLanguage))
            .catch((promiseError: unknown): void | never => {
                if (promiseError instanceof LeavServerError) {
                    setError(promiseError.message);
                } else {
                    throw promiseError;
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return {error, loading};
};
