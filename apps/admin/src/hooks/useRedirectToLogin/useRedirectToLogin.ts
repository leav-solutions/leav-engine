// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const isDevEnv = () => import.meta.env.DEV;

export default function useRedirectToLogin() {
    return {
        redirectToLogin: async () => {
            if (isDevEnv()) {
                return window.location.replace(`${window.location.origin}/app/login/?dest=${window.location.pathname}`);
            }
            return window.location.reload();
        }
    };
}
