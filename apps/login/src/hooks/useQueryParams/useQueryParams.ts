// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMemo} from 'react';
import {useLocation} from 'react-router-dom';

export default function useQueryParams(): {[key: string]: string} {
    const {search} = useLocation();
    const searchParams = useMemo(() => {
        const paramsObj = {};
        new URLSearchParams(search).forEach((value, key) => {
            paramsObj[key] = value;
        });

        return paramsObj;
    }, [search]);

    return searchParams;
}
