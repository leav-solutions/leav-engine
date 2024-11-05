// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {useCallback, useMemo} from 'react';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import {
    getActiveLibrary,
    IActiveLibrary,
    IGetActiveLibrary
} from '../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';

export const initialActiveLibrary: IActiveLibrary = {
    id: '',
    name: '',
    behavior: LibraryBehavior.standard,
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
