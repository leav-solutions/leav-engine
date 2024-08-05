// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const _redirectToLogin = () =>
    window.location.replace(`${window.location.origin}/app/login/?dest=${window.location.pathname}`);

const isDevelopmentHelper = () => import.meta.env.DEV;

export default function useRefreshToken() {
    return {
        refreshToken: async (autoReload: boolean = true) => {
            const res = await fetch('/auth/refresh', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });

            // If we didn't get a 2xx response, reload the page and let the back handle auth
            if (!res.ok) {
                if (autoReload) {
                    if (isDevelopmentHelper()) {
                        return _redirectToLogin();
                    }
                    return window.location.reload();
                }

                throw new Error(res.statusText, {cause: res});
            }
        }
    };
}
