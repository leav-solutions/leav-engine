// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Loading} from '@leav/ui';
import {useAuthChecker} from 'hooks/useAuthChecker';
import {useRedirectToDest} from 'hooks/useRedirectToDest';

interface IAuthHandlerProps {
    children: React.ReactNode;
}

export default function AuthHandler({children}: IAuthHandlerProps) {
    const authCheckStatus = useAuthChecker();
    const {redirectToDest} = useRedirectToDest();

    if (authCheckStatus === 'loading') {
        return <Loading />;
    }

    if (authCheckStatus === 'success') {
        redirectToDest();
    }

    return <>{children}</>;
}
