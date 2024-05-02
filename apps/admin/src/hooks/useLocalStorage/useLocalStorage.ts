// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useCurrentApplicationContext} from 'context/CurrentApplicationContext';
import {useEffect, useState} from 'react';

function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const applicationData = useCurrentApplicationContext();
    const storageKey = `${applicationData.currentApp.id}-${key}`;

    const _getStorageValue = (): T => {
        // getting stored value
        const saved = localStorage.getItem(storageKey);
        const initial = JSON.parse(saved);
        return initial || defaultValue;
    };

    const [value, setValue] = useState<T>(() => _getStorageValue());

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(value));
    }, [storageKey, value]);

    return [value, setValue];
}

export default useLocalStorage;
