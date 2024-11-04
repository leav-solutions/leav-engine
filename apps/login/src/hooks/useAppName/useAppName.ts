// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';

export default function useAppName() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>();
    const [name, setName] = useState<string>('');

    const _fetchName = async () => {
        try {
            const res = await fetch('/global-name', {method: 'GET'});
            const resContent = await res.text();
            setName(resContent);
        } catch (err) {
            setError(String(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        _fetchName();
    }, []);

    return {name, error, loading: isLoading};
}
