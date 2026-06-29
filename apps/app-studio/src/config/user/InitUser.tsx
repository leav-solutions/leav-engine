import {useGetUserIdentityQuery} from '../../__generated__';
import {type IUserContext, UserContext} from '@leav/ui';
import {type FunctionComponent, useEffect, useMemo} from 'react';
import {matomo} from '../../services/analytics';

export const InitUser: FunctionComponent = ({children}) => {
    const {data: userData, error, loading} = useGetUserIdentityQuery();

    useEffect(() => {
        if (loading) {
            return;
        }
        const groups =
            userData?.me?.user_groups
                ?.map(v => v.payload?.record.whoAmI.label)
                .sort()
                .join(' | ') ?? '';
        matomo.setUserRole(groups);
    }, [loading]);

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
