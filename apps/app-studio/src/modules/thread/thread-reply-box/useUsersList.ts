// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
