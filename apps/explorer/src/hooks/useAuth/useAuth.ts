// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
interface IAuthHook {
    logout: () => Promise<void>;
}

function useAuth(): IAuthHook {
    return {
        logout: async () => {
            await fetch('/auth/logout', {method: 'POST'});
            window.location.reload();
        }
    };
}

export default useAuth;
