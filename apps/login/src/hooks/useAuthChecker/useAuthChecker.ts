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
