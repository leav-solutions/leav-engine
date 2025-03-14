// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import i18next from 'i18next';
import {useContext, useMemo} from 'react';
import {initReactI18next, useTranslation} from 'react-i18next';
import {LangContext} from '../../contexts';
import en from '../../locales/en/shared.json';
import fr from '../../locales/fr/shared.json';

const useSharedTranslation = () => {
    const langContext = useContext(LangContext);

    const i18n = useMemo(
        () =>
            i18next.use(initReactI18next).createInstance(
                {
                    lng: langContext.lang[0],
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
