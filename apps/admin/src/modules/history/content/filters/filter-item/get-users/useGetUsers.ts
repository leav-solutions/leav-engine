// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useGetUsersLazyQuery} from '../../../../../../_gqlTypes';

type User = {
    id: string;
    email: string;
};

export const useGetUsers = () => {
    const [fetchUsers, {data, loading}] = useGetUsersLazyQuery();

    const users: User[] = (data?.records.list ?? []).map(user => ({
        id: user.id,
        email: user.email[0]?.payload ?? user.id,
    }));

    return {fetchUsers, users, loading};
};
