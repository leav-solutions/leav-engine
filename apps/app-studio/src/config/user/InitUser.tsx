import {useGetUserIdentityQuery} from '../../__generated__';
import {type IUserContext, UserContext} from '@leav/ui';
import {type FunctionComponent, useEffect, useMemo} from 'react';
import {matomo} from '../../services/analytics';
import {UserGroupsProvider} from './UserGroupsContext';

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

    const groupIds = useMemo(
        () =>
            userData?.me?.user_groups
                ?.map(v => v.payload?.record.whoAmI.id)
                .filter((id): id is string => Boolean(id)) ?? [],
        [userData],
    );

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

    return (
        <UserContext.Provider value={userIdentity}>
            <UserGroupsProvider value={groupIds}>{children}</UserGroupsProvider>
        </UserContext.Provider>
    );
};
