import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-xhr-backend';
import {reactI18nextModule} from 'react-i18next';

i18n.use(reactI18nextModule)
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
