// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useEffect, useState} from 'react';

function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const _getStorageValue = (): T => {
        // getting stored value
        const saved = localStorage.getItem(key);
        const initial = JSON.parse(saved) as T;
        return initial || defaultValue;
    };

    const [value, setValue] = useState<T>(() => _getStorageValue());

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

export default useLocalStorage;
