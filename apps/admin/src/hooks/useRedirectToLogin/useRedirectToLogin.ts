const isDevEnv = () => import.meta.env.DEV;
import {GLOBAL_BASE_URL} from '../../constants';

export default function useRedirectToLogin() {
    const redirectToLogin = () => {
        if (isDevEnv()) {
            return window.location.replace(
                `${window.location.origin}${GLOBAL_BASE_URL}/app/login/?dest=${encodeURIComponent(window.location.toString())}`,
            );
        }
        return window.location.reload();
    };

    // Avoid multiple simultaneous auth checks by sharing the same promise
    let authCheckPromise: Promise<void> | null = null;

    return {
        redirectToLogin,
        checkAuthOrRedirectToLogin: async () => {
            if (!authCheckPromise) {
                authCheckPromise = (async () => {
                    try {
                        const res = await fetch(`${GLOBAL_BASE_URL}/auth/login-checker`, {
                            method: 'POST',
                        });
                        if (!res.ok) {
                            throw new Error(res.statusText, {cause: res});
                        }
                    } catch (e) {
                        console.error('An error occurred while checking authentication, redirecting to login...', {
                            error: e,
                        });
                        redirectToLogin();
                    } finally {
                        authCheckPromise = null;
                    }
                })();
            }
            return authCheckPromise;
        },
    };
}
