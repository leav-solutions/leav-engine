import {type Locale} from 'antd/es/locale';
import enUS from 'antd/lib/locale/en_US';
import frFR from 'antd/lib/locale/fr_FR';

const useAntdLocale = (lang: string): Locale => {
    const localeByLang = {
        fr: frFR,
        en: enUS,
    };

    return localeByLang[lang] ?? enUS;
};

export default useAntdLocale;
