import {useLoginChecker} from '@leav/ui';
import {useEffect, useState} from 'react';

export type UseAuthCheckerStatus = 'loading' | 'success' | 'fail';

export default function useAuthChecker(): UseAuthCheckerStatus {
    const [status, setStatus] = useState<UseAuthCheckerStatus>('loading');
    const {loginChecker} = useLoginChecker();

    const _executeAuthCheck = async () => {
        try {
            await loginChecker();

            setStatus('success');
        } catch {
            setStatus('fail');
        }
    };

    useEffect(() => {
        _executeAuthCheck();
    }, []);

    return status;
}
