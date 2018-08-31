import * as i18n from 'i18next';
import * as LanguageDetector from 'i18next-browser-languagedetector';
import * as Backend from 'i18next-xhr-backend';
import {reactI18nextModule} from 'react-i18next';

i18n.use(reactI18nextModule)
    .use(Backend)
    .use(LanguageDetector)
    .init({
        fallbackLng: 'en',
        ns: ['translations'],
        defaultNS: 'translations',
        react: {
            wait: true
        }
    });

export default i18n;
