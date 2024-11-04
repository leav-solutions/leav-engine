// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export default function useLoginChecker() {
    return {
        loginChecker: async () => {
            const res = await fetch('/auth/login-checker', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });

            if (!res.ok) {
                throw new Error(res.statusText, {cause: res});
            }
        }
    };
}
