import {GLOBAL_BASE_URL} from '../../constants';

interface IAuthHook {
    logout: () => Promise<void>;
}

function useAuth(): IAuthHook {
    return {
        logout: async () => {
            const response = await fetch(`${GLOBAL_BASE_URL}/auth/logout`, {method: 'POST'});
            const data = await response.json();
            if (data?.redirectUrl) {
                window.location.assign(data.redirectUrl);
                return;
            }
            window.location.reload();
        },
    };
}

export default useAuth;
