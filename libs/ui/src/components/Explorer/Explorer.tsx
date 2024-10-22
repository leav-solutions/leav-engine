// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {DataView} from './DataView';
import {useExplorerData} from './useExplorerData';

export const Explorer: FunctionComponent<{library: string}> = ({library}) => {
    const {data, loading} = useExplorerData(library);

    return <div>{loading ? 'Loading...' : <DataView dataGroupedFilteredSorted={data ?? []} />}</div>;
};
