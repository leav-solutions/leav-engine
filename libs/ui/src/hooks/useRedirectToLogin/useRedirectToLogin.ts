// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {isDevEnv} from '_ui/_utils/isDevEnv';

export default function useRedirectToLogin() {
    return {
        redirectToLogin: async () => {
            if (isDevEnv()) {
                return window.location.replace(
                    `${window.location.origin}/app/login/?dest=${encodeURIComponent(window.location.toString())}`
                );
            }
            return window.location.reload();
        }
    };
}
