import React, {ReactElement} from 'react';
import UserContext, {IUserContext} from '../../components/shared/UserContext/UserContext';
import {PermissionsActions} from '../../_gqlTypes/globalTypes';

interface IProps {
    permissions?: {[permName: string]: boolean};
    children: ReactElement;
}
function MockedUserContextProvider({permissions, children}: IProps) {
    const userData: IUserContext = {
        id: 1,
        name: 'Test',
        permissions:
            permissions ??
            Object.values(PermissionsActions)
                .filter(a => !!a.match(/^app_/))
                .reduce((perms, p) => {
                    perms[p] = true;

                    return perms;
                }, {})
    };

    return <UserContext.Provider value={userData}>{children}</UserContext.Provider>;
}

export default MockedUserContextProvider;
