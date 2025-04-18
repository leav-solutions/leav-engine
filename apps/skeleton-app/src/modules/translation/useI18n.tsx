import {useEffect, useState} from 'react';
import {LeavServerError} from './LeavServerError';
import {getLeavFallbackLanguage} from './translationService';
import {defaultLanguage, supportedLanguages} from './translationConstants';
import {initI18n} from './initI18n';

const LOCAL_STORAGE_LANG_KEY = 'i18nextLng';

type UseI18n = () => { error: string | null; loading: boolean };

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
            .then(fallbackLanguage =>
                initI18n(fallbackLanguage)
            )
            .catch((error: unknown): void | never => {
                if (error instanceof LeavServerError) {
                    setError(error.message);
                } else {
                    throw error;
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return {error, loading};
};
