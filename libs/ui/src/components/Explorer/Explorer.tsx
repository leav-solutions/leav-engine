// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {IItemAction, IPrimaryAction} from './_types';
import {DataView} from './DataView';
import {useOpenSettings} from './edit-settings/useOpenSettings';
import {useExplorerData} from './_queries/useExplorerData';
import {useDeactivateAction} from './useDeactivateAction';
import {useEditAction} from './useEditAction';
import {usePrimaryActionsButton as usePrimaryActionsButton} from './usePrimaryActions';
import {ExplorerTitle} from './ExplorerTitle';
import {useCreateAction} from './useCreateAction';
import {useViewSettingsContext} from './edit-settings/useViewSettingsContext';

interface IExplorerProps {
    library: string;
    itemActions?: IItemAction[];
    primaryActions?: IPrimaryAction[];
    title?: string;
    defaultActionsForItem?: Array<'edit' | 'deactivate'>;
    defaultPrimaryActions?: Array<'create'>;
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
    primaryActions,
    title,
    defaultActionsForItem = ['edit', 'deactivate'],
    defaultPrimaryActions = ['create']
}) => {
    const {view} = useViewSettingsContext();

    const {data, loading, refetch} = useExplorerData(library, view.fields); // TODO: refresh when go back on page

    const {deactivateAction} = useDeactivateAction({
        isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('deactivate')
    });

    const {editAction, editModal} = useEditAction({
        isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('edit')
    });

    const {createAction, createModal} = useCreateAction({
        isEnabled: isNotEmpty(defaultPrimaryActions) && defaultPrimaryActions.includes('create'),
        library,
        refetch
    });

    const enabledDefaultActions = createAction ? [createAction] : [];

    const {primaryButton} = usePrimaryActionsButton([...enabledDefaultActions, ...(primaryActions ?? [])]);

    const settingsButton = useOpenSettings(library);

    const dedupItemActions = [...new Set([editAction, deactivateAction, ...(itemActions ?? [])].filter(Boolean))];

    return (
        <>
            {loading ? (
                'Loading...' // TODO: handle loading properly
            ) : (
                <>
                    <ExplorerHeaderDivStyled>
                        <KitTypography.Title level="h1">
                            <ExplorerTitle library={library} title={title} />
                        </KitTypography.Title>
                        <KitSpace size="xs">
                            {settingsButton}
                            {primaryButton}
                        </KitSpace>
                    </ExplorerHeaderDivStyled>
                    <DataView
                        dataGroupedFilteredSorted={data?.records ?? []}
                        itemActions={dedupItemActions}
                        columnsLabels={data?.attributes}
                        attributesToDisplay={['whoAmI', ...view.fields]}
                    />
                </>
            )}
            {editModal}
            {createModal}
        </>
    );
};
