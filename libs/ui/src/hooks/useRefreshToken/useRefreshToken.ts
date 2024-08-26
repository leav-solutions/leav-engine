// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isDevelopmentHelper} from '_ui/_utils/isDevelopmentHelper';

const _redirectToLogin = () =>
    window.location.replace(`${window.location.origin}/app/login/?dest=${window.location.pathname}`);

export default function useRefreshToken() {
    return {
        refreshToken: async (autoReload: boolean = true) => {
            const res = await fetch('/auth/refresh', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });

            // If we didn't get a 2xx response, reload the page and let the back handle auth, unless we explicitly
            // ask not to reload (e.g. in login app)
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
