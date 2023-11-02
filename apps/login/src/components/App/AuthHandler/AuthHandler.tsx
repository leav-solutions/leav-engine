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
