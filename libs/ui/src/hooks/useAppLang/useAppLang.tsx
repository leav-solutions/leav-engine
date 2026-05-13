import {GLOBAL_BASE_URL} from '_ui/constants';
import {useEffect, useState} from 'react';

export default function useAppLang() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | undefined>();
    const [lang, setLang] = useState('');

    const _fetchLang = async () => {
        try {
            const res = await fetch(`${GLOBAL_BASE_URL}/global-lang`, {method: 'GET'});

            // make the promise be rejected if we didn't get a 2xx response
            if (!res.ok) {
                throw new Error(
                    res.status === 404
                        ? 'Unable to connect to server. Please check your Internet connection.'
                        : res.statusText,
                    {cause: res},
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
