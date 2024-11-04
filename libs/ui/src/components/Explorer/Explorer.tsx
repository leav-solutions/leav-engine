// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {ItemActions} from './types';
import {DataView} from './DataView';
import {useExplorerData} from './useExplorerData';
import {useDeactivateAction} from './useDeactivateAction';
import {useEditAction} from './useEditAction';
import {useCreateMainAction} from './useCreateMainAction';

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
    defaultMainActions?: [] | ['create'];
}

const isNotEmpty = <T extends unknown[]>(union: T): union is Exclude<T, []> => union.length > 0;

const ExplorerHeaderDivStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: calc(var(--general-spacing-xs) * 1px);
`;

export const Explorer: FunctionComponent<IExplorerProps> = ({
    library,
    itemActions,
    defaultActionsForItem = ['edit', 'deactivate'],
    defaultMainActions = ['create']
}) => {
    const {data, loading, refetch} = useExplorerData(library); // TODO: refresh when go back on page

    const {deactivateAction} = useDeactivateAction({
        isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('deactivate')
    });

    const {editAction, editModal} = useEditAction({
        isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('edit')
    });

    const {createButton, createModal} = useCreateMainAction({
        isEnabled: isNotEmpty(defaultMainActions) && defaultMainActions.includes('create'),
        library,
        refetch
    });

    return (
        <>
            {loading ? (
                'Loading...'
            ) : (
                <>
                    <ExplorerHeaderDivStyled>
                        <KitTypography.Title level="h1">
                            {library /* TODO: get correct name from backend */}
                        </KitTypography.Title>
                        {createButton}
                    </ExplorerHeaderDivStyled>
                    <DataView
                        dataGroupedFilteredSorted={data ?? []}
                        attributesToDisplay={['itemId', 'whoAmI']}
                        itemActions={[editAction, deactivateAction, ...itemActions].filter(Boolean)}
                    />
                </>
            )}
            {editModal}
            {createModal}
        </>
    );
};
