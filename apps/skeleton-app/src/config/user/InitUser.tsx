// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetUserIdentityQuery} from '../../__generated__';
import {IUserContext, UserContext} from '@leav/ui';
import {type FunctionComponent, useMemo} from 'react';

export const InitUser: FunctionComponent = ({children}) => {
    const {data: userData, error} = useGetUserIdentityQuery();

    const userIdentity = useMemo<IUserContext>(() => {
        if (userData?.me == null) {
            return {
                userData: null
            };
        }

        return {
            userData: {
                userId: userData.me.whoAmI.id,
                userWhoAmI: userData.me.whoAmI
            }
        };
    }, [userData]);

    if (error) {
        throw error;
    }

    return <UserContext.Provider value={userIdentity}>{children}</UserContext.Provider>;
};
