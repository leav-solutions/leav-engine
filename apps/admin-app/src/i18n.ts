// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-xhr-backend';
import {initReactI18next} from 'react-i18next';

i18n.use(initReactI18next)
    .use(Backend)
    .use(LanguageDetector)
    .init({
        fallbackLng: process.env.REACT_APP_DEFAULT_LANG,
        ns: ['translations'],
        defaultNS: 'translations',
        react: {
            wait: true
        }
    });

export default i18n;
