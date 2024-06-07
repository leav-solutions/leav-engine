// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import useRefreshToken from 'hooks/useRefreshToken';

interface IAuthHook {
    logout: () => Promise<void>;
}

function useAuth(): IAuthHook {
    const {setRefreshToken} = useRefreshToken();

    return {
        // TODO Pourquoi est-ce que l'on utilise pas ici le logout de leav-ui ?
        logout: async () => {
            const response = await fetch('/auth/logout', {method: 'POST'});
            const data = await response.json();
            if (data) {
                window.location.assign(data.redirectUrl);
                return;
            }
            setRefreshToken('');
            window.location.reload();
        }
    };
}

export default useAuth;
