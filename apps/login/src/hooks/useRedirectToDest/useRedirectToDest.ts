import {useQueryParams} from 'hooks/useQueryParams';

export interface IUseRedirectToDestHook {
    redirectToDest: () => void;
}

export default function useRedirectToDest() {
    const params = useQueryParams();

    return {
        redirectToDest: () => {
            const redirectTo = params.dest ?? '/';
            window.location.replace(redirectTo);
        }
    };
}
