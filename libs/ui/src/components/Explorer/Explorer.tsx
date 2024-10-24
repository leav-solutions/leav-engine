// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {DataView} from './DataView';
import {useExplorerData} from './useExplorerData';
import {ItemActions} from './types';

interface IExplorerProps {
    library: string;
    itemActions: ItemActions<any>;
}

export const Explorer: FunctionComponent<IExplorerProps> = ({library, itemActions}) => {
    const {data, loading} = useExplorerData(library);

    return (
        <div>
            {loading ? (
                'Loading...'
            ) : (
                <DataView
                    dataGroupedFilteredSorted={data ?? []}
                    attributesToDisplay={['itemId', 'whoAmI']}
                    itemActions={itemActions}
                />
            )}
        </div>
    );
};
