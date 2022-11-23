// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {useCallback, useMemo} from 'react';
import {
    getActiveLibrary,
    IActiveLibrary,
    IGetActiveLibrary
} from '../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';

export const initialActiveLibrary = {
    id: '',
    name: '',
    filter: '',
    gql: {
        searchableFields: '',
        query: '',
        type: ''
    },
    attributes: [],
    trees: [],
    permissions: {
        access_library: true,
        access_record: true,
        create_record: true,
        edit_record: true,
        delete_record: true
    }
};

export const useActiveLibrary = (): [IActiveLibrary | undefined, (newActiveLibrary: IActiveLibrary) => void] => {
    const {data, client} = useQuery<IGetActiveLibrary>(getActiveLibrary);

    const activeLibrary: IActiveLibrary | undefined = useMemo(() => data?.activeLib ?? initialActiveLibrary, [data]);

    const updateActiveLibrary = useCallback(
        (newActiveLibrary: IActiveLibrary) => {
            client.writeQuery({
                query: getActiveLibrary,
                data: {
                    activeLib: {
                        ...newActiveLibrary,
                        trees: newActiveLibrary.trees.filter(tree => tree.permissions.access_tree)
                    }
                }
            });
        },
        [client]
    );

    return [activeLibrary, updateActiveLibrary];
};
