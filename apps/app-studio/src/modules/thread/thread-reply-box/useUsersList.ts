import {useGetUsersLazyQuery} from '../../../__generated__';

interface IUser {
    id: string;
    label: string;
}

export const useUsersList = () => {
    const [lazyGetUsers] = useGetUsersLazyQuery();

    return async function getUsersList(query: string): Promise<IUser[]> {
        const {data} = await lazyGetUsers({
            variables: {query, pagination: {offset: 0, limit: 5}},
        });

        return data.records.list.map(record => ({
            id: record.id,
            label: record.label[0]?.payload,
        }));
    };
};
