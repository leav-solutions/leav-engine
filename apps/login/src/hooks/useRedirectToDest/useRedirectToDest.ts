// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GLOBAL_BASE_URL} from '../../constants';
import {useQueryParams} from 'hooks/useQueryParams';

export default function useRedirectToDest() {
    const params = useQueryParams();

    return {
        redirectToDest: () => {
            const redirectTo = params.dest ? decodeURIComponent(params.dest) : GLOBAL_BASE_URL || '/';
            window.location.replace(redirectTo);
        },
    };
}
