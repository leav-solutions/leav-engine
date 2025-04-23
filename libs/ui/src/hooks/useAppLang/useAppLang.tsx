// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';

export default function useAppLang() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();
    const [lang, setLang] = useState('');

    const _fetchLang = async () => {
        try {
            const res = await fetch('/global-lang', {method: 'GET'});

            // make the promise be rejected if we didn't get a 2xx response
            if (!res.ok) {
                throw new Error(
                    res.status === 404
                        ? 'Unable to connect to server. Please check your Internet connection.'
                        : res.statusText,
                    {cause: res}
                );
            }

            const resContent = await res.text();
            setLang(resContent);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        _fetchLang();
    }, []);

    return {lang, error, loading: isLoading};
}
