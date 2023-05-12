// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';

export default function useAppLang() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [lang, setLang] = useState<string>('');

    const _fetchLang = async () => {
        try {
            const res = await fetch('/global-lang', {method: 'GET'});
            const resContent = await res.text();
            setLang(resContent);
        } catch (err) {
            setError(String(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        _fetchLang();
    }, []);

    return {lang, error, loading: isLoading};
}
