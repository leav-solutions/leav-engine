// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import {initReactI18next} from 'react-i18next';

export const initI18n = (defaultLang: string) =>
    i18n
        .use(initReactI18next)
        .use(
            resourcesToBackend((language, namespace) => {
                try {
                    return import(`./locales/${language}/${namespace}.json`);
                } catch (e) {
                    console.error('Error while fetching translations files', e);
                }
            })
        )
        .use(LanguageDetector)
        .init({
            fallbackLng: defaultLang,
            ns: ['translations'],
            defaultNS: 'translations',
            react: {
                useSuspense: true
            }
        });
