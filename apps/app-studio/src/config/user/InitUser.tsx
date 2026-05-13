import {useGetUserIdentityQuery} from '../../__generated__';
import {type IUserContext, UserContext} from '@leav/ui';
import {type FunctionComponent, useMemo} from 'react';

export const InitUser: FunctionComponent = ({children}) => {
    const {data: userData, error} = useGetUserIdentityQuery();

    const userIdentity = useMemo<IUserContext>(() => {
        if (userData?.me) {
            return {
                userData: {
                    userId: userData.me.whoAmI.id,
                    userWhoAmI: userData.me.whoAmI,
                },
            };
        }
        return {
            userData: null,
        };
    }, [userData]);

    if (error) {
        throw error;
    }

    return <UserContext.Provider value={userIdentity}>{children}</UserContext.Provider>;
};
