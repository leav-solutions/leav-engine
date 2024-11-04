// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Locale} from 'antd/es/locale';
import enUS from 'antd/lib/locale/en_US';
import frFR from 'antd/lib/locale/fr_FR';

const useAntdLocale = (lang: string): Locale => {
    const localeByLang = {
        fr: frFR,
        en: enUS
    };

    return localeByLang[lang] ?? enUS;
};

export default useAntdLocale;
