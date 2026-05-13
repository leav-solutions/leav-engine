import {GLOBAL_BASE_URL} from '../../constants';
import {useQueryParams} from '../useQueryParams';

export default function useRedirectToDest() {
    const params = useQueryParams();

    return {
        redirectToDest: () => {
            const redirectTo = params.dest ? decodeURIComponent(params.dest) : GLOBAL_BASE_URL || '/';
            window.location.replace(redirectTo);
        },
    };
}
