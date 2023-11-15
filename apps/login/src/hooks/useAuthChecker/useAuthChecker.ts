// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useRefreshToken} from '@leav/ui';
import {useEffect, useState} from 'react';

export type UseAuthCheckerStatus = 'loading' | 'success' | 'fail';

export default function useAuthChecker(): UseAuthCheckerStatus {
    const [status, setStatus] = useState<UseAuthCheckerStatus>('loading');
    const {refreshToken} = useRefreshToken();

    const _executeAuthCheck = async () => {
        try {
            await refreshToken();
            setStatus('success');
        } catch (err) {
            setStatus('fail');
        }
    };

    useEffect(() => {
        _executeAuthCheck();
    }, []);

    return status;
}
