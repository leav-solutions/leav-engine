import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {useContext, useMemo} from 'react';
import {initReactI18next, useTranslation} from 'react-i18next';
import {LangContext} from '../../contexts';
import en from '../../locales/en/shared.json';
import fr from '../../locales/fr/shared.json';

const useSharedTranslation = () => {
    const langContext = useContext(LangContext);

    const i18n = useMemo(
        () =>
            i18next
                .use(initReactI18next)
                .use(LanguageDetector)
                .createInstance(
                    {
                        fallbackLng: langContext.defaultLang,
                        ns: ['shared'],
                        defaultNS: 'shared',
                        resources: {
                            fr: {shared: fr},
                            en: {shared: en}
                        },
                        react: {
                            useSuspense: true
                        }
                    },
                    (err, t) => {
                        if (err) {
                            return console.error('Something went wrong loading', err);
                        }
                    }
                ),
        [langContext.lang]
    );

    return useTranslation('shared', {i18n});
};

export default useSharedTranslation;
