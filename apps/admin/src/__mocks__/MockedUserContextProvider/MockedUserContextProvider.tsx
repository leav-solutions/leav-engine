import React, {type ReactElement} from 'react';
import UserContext, {type IUserContext} from '../../components/shared/UserContext/UserContext';
import {PermissionsActions} from '../../_gqlTypes';

interface IProps {
    permissions?: {[permName: string]: boolean};
    children: ReactElement;
}
function MockedUserContextProvider({permissions, children}: IProps) {
    const userData: IUserContext = {
        id: '1',
        whoAmI: {
            id: '1',
            label: 'Test',
            library: {
                id: 'users',
                label: {fr: 'Users'},
            },
            color: null,
            preview: null,
        },
        permissions:
            permissions ??
            Object.values(PermissionsActions)
                .filter(a => !!a.match(/^admin_/))
                .reduce((perms, p) => {
                    perms[p] = true;

                    return perms;
                }, {}),
    };

    return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}

export default MockedUserContextProvider;
