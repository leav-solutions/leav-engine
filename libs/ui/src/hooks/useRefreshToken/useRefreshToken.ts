// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export default function useRefreshToken() {
    const REFRESH_TOKEN_KEY = 'refreshToken';

    return {
        setRefreshToken: (token: string) => {
            localStorage.setItem(REFRESH_TOKEN_KEY, token);
        },
        refreshToken: async () => {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

            const res = await fetch('/auth/refresh', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({refreshToken})
            });

            // make the promise be rejected if we didn't get a 2xx response
            if (!res.ok) {
                throw new Error(res.statusText, {cause: res});
            }

            res.json().then(data => {
                localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
            });
        }
    };
}
