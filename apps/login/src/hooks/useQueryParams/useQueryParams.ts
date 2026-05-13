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
