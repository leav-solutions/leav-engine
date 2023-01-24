// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';

export default function useAppName() {
    const [name, setName] = useState<string>('');

    const _fetchName = async () => {
        const res = await fetch('/global-name', {method: 'GET'});

        const resContent = await res.text();

        setName(resContent);
    };

    useEffect(() => {
        _fetchName();
    }, []);

    return name;
}
