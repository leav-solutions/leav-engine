// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useReducer} from 'react';
import {createPortal} from 'react-dom';
import {KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {IItemAction, IPrimaryAction} from './_types';
import {useExplorerData} from './_queries/useExplorerData';
import {DataView} from './DataView';
import {useDeactivateAction} from './useDeactivateAction';
import {useEditAction} from './useEditAction';
import {usePrimaryActionsButton} from './usePrimaryActions';
import {ExplorerTitle} from './ExplorerTitle';
import {useCreateAction} from './useCreateAction';
import {
    useOpenSettings,
    SidePanel,
    useEditSettings,
    viewSettingsReducer,
    ViewSettingsContext,
    viewSettingsInitialState,
    type IViewSettingsState
} from './manage-view-settings';

interface IExplorerProps {
    library: string;
    itemActions?: IItemAction[];
    primaryActions?: IPrimaryAction[];
    title?: string;
    defaultActionsForItem?: Array<'edit' | 'deactivate'>;
    defaultPrimaryActions?: Array<'create'>;
    defaultViewSettings?: Partial<IViewSettingsState>;
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
    defaultPrimaryActions = ['create'],
    defaultViewSettings
}) => {
    const {panelElement} = useEditSettings();

    const [view, dispatch] = useReducer(viewSettingsReducer, {...viewSettingsInitialState, ...defaultViewSettings});

    const {data, loading, refetch} = useExplorerData({
        libraryId: library,
        attributeIds: view.attributesIds,
        sorts: view.sort
    }); // TODO: refresh when go back on page

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

    // TODO: move to `useCreateAction` directly?
    const enabledDefaultActions = createAction ? [createAction] : [];

    const {primaryButton} = usePrimaryActionsButton([...enabledDefaultActions, ...(primaryActions ?? [])]);

    // TODO: harmonize to other hook signature that return only object
    const settingsButton = useOpenSettings(library);

    // TODO: remove SET
    const dedupItemActions = [...new Set([editAction, deactivateAction, ...(itemActions ?? [])].filter(Boolean))];

    return (
        <ViewSettingsContext.Provider value={{view, dispatch}}>
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
                        attributesProperties={data?.attributes ?? {}}
                        attributesToDisplay={['whoAmI', ...view.attributesIds]}
                    />
                </>
            )}
            {panelElement && createPortal(<SidePanel />, panelElement)}
            {editModal}
            {createModal}
        </ViewSettingsContext.Provider>
    );
};
