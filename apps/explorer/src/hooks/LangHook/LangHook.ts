// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {useCallback} from 'react';
import {getLangAll, IGetLangAll} from '../../queries/cache/lang/getLangQuery';

export const useLang = (): [IGetLangAll, (langInfo: Partial<IGetLangAll>) => void] => {
    const {data, client} = useQuery<IGetLangAll>(getLangAll);

    const lang = data?.lang || [];
    const availableLangs = data?.availableLangs || [];
    const defaultLang = data?.defaultLang || '';

    const updateLang = useCallback(
        (langInfo: Partial<IGetLangAll>) => {
            const newLang = langInfo?.lang || lang;
            const newAvailableLangs = langInfo?.availableLangs || availableLangs;
            const newDefaultLang = langInfo?.defaultLang || defaultLang;

            client.writeQuery({
                query: getLangAll,
                data: {lang: newLang, availableLangs: newAvailableLangs, defaultLang: newDefaultLang}
            });
        },
        [client, lang, availableLangs, defaultLang]
    );

    return [
        {
            lang,
            availableLangs,
            defaultLang
        },
        updateLang
    ];
};
