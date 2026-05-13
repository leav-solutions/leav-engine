import {useGetUsersLazyQuery} from '../../../../../../../_gqlTypes';

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
