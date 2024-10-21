// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useState} from 'react';
import {IDataGroupedFilteredSorted} from '_ui/components/Explorer/types';
import {DataView} from './DataView';

export const Explorer: FunctionComponent<{library: string}> = ({library}) => {
    // TODO: make API call
    const [data, setData] = useState<IDataGroupedFilteredSorted[] | null>(null);

    return (
        <div>
            This is the Explorer! on library {library}
            {data === null ? 'Loading...' : <DataView data={data} />}
        </div>
    );
};
