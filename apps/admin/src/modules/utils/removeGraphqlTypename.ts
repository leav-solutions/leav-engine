// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export const removeGraphqlTypename = <T>(value: T): T => {
    if (Array.isArray(value)) {
        return value.map(removeGraphqlTypename) as T;
    }

    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([key]) => key !== '__typename')
                .map(([key, val]) => [key, removeGraphqlTypename(val)]),
        ) as T;
    }

    return value;
};
