// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
        } catch (err) {
            setStatus('fail');
        }
    };

    useEffect(() => {
        _executeAuthCheck();
    }, []);

    return status;
}
