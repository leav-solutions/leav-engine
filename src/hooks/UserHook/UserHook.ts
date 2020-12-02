// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {useCallback} from 'react';
import {getUser, IGetUser} from '../../queries/cache/user/userQuery';

export const useUser = (): [IGetUser | undefined, (newUser: IGetUser) => void] => {
    const {data: user, client} = useQuery<IGetUser>(getUser);

    const updateUser = useCallback(
        (newUser: IGetUser) => {
            client.writeQuery<IGetUser>({
                query: getUser,
                data: newUser
            });
        },
        [client]
    );

    return [user, updateUser];
};
