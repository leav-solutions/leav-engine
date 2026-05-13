import {GLOBAL_BASE_URL} from '_ui/constants';

export default function useLoginChecker() {
    return {
        loginChecker: async () => {
            const res = await fetch(`${GLOBAL_BASE_URL}/auth/login-checker`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
            });

            if (!res.ok) {
                throw new Error(res.statusText, {cause: res});
            }
        },
    };
}
