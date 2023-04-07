// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';

export default function useAppLang() {
    const [lang, setLang] = useState<string>('');

    const _fetchLang = async () => {
        const res = await fetch('/global-lang', {method: 'GET'});
        const resContent = await res.text();

        setLang(resContent);
    };

    useEffect(() => {
        _fetchLang();
    }, []);

    return lang;
}
