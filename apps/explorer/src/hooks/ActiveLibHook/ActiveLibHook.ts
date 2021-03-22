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

export const useActiveLibrary = (): [IActiveLibrary | undefined, (newActiveLibrary: IActiveLibrary) => void] => {
    const {data, client} = useQuery<IGetActiveLibrary>(getActiveLibrary);

    const activeLibrary: IActiveLibrary | undefined = useMemo(() => data?.activeLib, [data]);

    const updateActiveLibrary = useCallback(
        (newActiveLibrary: IActiveLibrary) => {
            client.writeQuery({
                query: getActiveLibrary,
                data: {
                    activeLib: newActiveLibrary
                }
            });
        },
        [client]
    );

    return [activeLibrary, updateActiveLibrary];
};
