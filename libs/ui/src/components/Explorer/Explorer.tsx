// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {ItemActions} from './types';
import {DataView} from './DataView';
import {useExplorerData} from './useExplorerData';
import {useDeactivateAction} from './useDeactivateAction';
import {useEditAction} from './useEditAction';

interface IExplorerProps {
    library: string;
    itemActions: ItemActions<any>;
    defaultActionsForItem?:
        | []
        | ['deactivate']
        | ['edit']
        | ['edit', 'deactivate']
        | ['deactivate', 'edit']
        | undefined;
}

const isNotEmpty = <T extends unknown[]>(union: T): union is Exclude<T, []> => union.length > 0;

export const Explorer: FunctionComponent<IExplorerProps> = ({
    library,
    itemActions,
    defaultActionsForItem = ['edit', 'deactivate']
}) => {
    const {data, loading} = useExplorerData(library); // TODO: refresh when go back on page

    // TODO: use apollo cache to deactivate items
    const {deactivateAction, deactivatedItemIds} = useDeactivateAction(
        isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('deactivate')
    );

    const {editAction, editModal} = useEditAction(
        isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('edit')
    );

    return (
        <>
            {loading ? (
                'Loading...'
            ) : (
                <DataView
                    dataGroupedFilteredSorted={data?.filter(({itemId}) => !deactivatedItemIds.includes(itemId)) ?? []}
                    attributesToDisplay={['itemId', 'whoAmI']}
                    itemActions={[editAction, deactivateAction, ...itemActions].filter(Boolean)}
                />
            )}
            {editModal}
        </>
    );
};
