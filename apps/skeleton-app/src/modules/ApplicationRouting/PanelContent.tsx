// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useEffect, useState} from 'react';
import {generatePath, Navigate, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {EditRecordPage, Explorer} from '@leav/ui';
import {FaPlus} from 'react-icons/all';
import type {IApplicationMatchingContext, CommonExplorerProps, LibraryExplorerProps} from './types';
import {recordSearchParamsName, routes} from './routes';
import {SIDEBAR_CONTENT_ID} from '../../constants';
import {PanelCustom} from './PanelCustom';

import {explorerContainer} from './PanelContent.module.css';

export const PanelContent: FunctionComponent = () => {
    const {t} = useTranslation();
    const {search} = useLocation();
    const searchParams = new URLSearchParams(search);
    const {currentPanel, currentWorkspace} =
        useOutletContext<Omit<IApplicationMatchingContext, 'currentParentTuple'>>();

    const navigate = useNavigate();

    const [sidebarContainer, setSidebarContainer] = useState<HTMLElement>();
    useEffect(() => {
        const element = document.getElementById(SIDEBAR_CONTENT_ID);
        if (element) {
            setSidebarContainer(element);
        }
    }, []);

    if ('content' in currentPanel) {
        const commonFormProps: Partial<ComponentProps<typeof EditRecordPage>> = {
            showRefreshButton: false,
            showHeader: false,
            showSidebar: false,
            sidebarContainer
        };
        if (currentPanel.content.type === 'creationForm') {
            return (
                <EditRecordPage
                    {...commonFormProps}
                    record={null}
                    creationFormId={currentPanel.content.formId}
                    library={currentWorkspace.entrypoint.libraryId}
                />
            );
        }
        if (currentPanel.content.type === 'editionForm') {
            return (
                <EditRecordPage
                    {...commonFormProps}
                    record={{
                        id: searchParams.get(recordSearchParamsName),
                        library: {
                            id: currentWorkspace.entrypoint.libraryId
                        }
                    }}
                    editionFormId={currentPanel.content.formId}
                    library={currentWorkspace.entrypoint.libraryId}
                />
            );
        }
        if (currentPanel.content.type === 'custom') {
            return (
                <PanelCustom source={currentPanel.content.iframeSource} searchQuery={search} title={currentPanel.id} />
            );
        }
        if (currentPanel.content.type === 'explorer') {
            const itemActions: ComponentProps<typeof Explorer>['itemActions'] = currentPanel.content.actions.map(
                action => ({
                    icon: <FaPlus />,
                    label: t('skeleton.explore'),
                    callback: item => {
                        const query = new URLSearchParams({[recordSearchParamsName]: item.itemId});
                        navigate(generatePath(routes.panel, {panelId: action.what.id}) + '?' + query.toString());
                    }
                })
            );

            const isBoolean = (val: unknown) => 'boolean' === typeof val;

            const commonExplorerProps = {
                showSearch: isBoolean(currentPanel.content.explorerProps.showSearch)
                    ? currentPanel.content.explorerProps.showSearch
                    : undefined,
                defaultPrimaryActions: currentPanel.content.explorerProps.defaultPrimaryActions,
                defaultActionsForItem: currentPanel.content.explorerProps.defaultActionsForItem,
                defaultMassActions: currentPanel.content.explorerProps.defaultMassActions,
                showFiltersAndSorts: currentPanel.content.explorerProps.showFiltersAndSorts,
                enableConfigureView: isBoolean(currentPanel.content.explorerProps.freezeView)
                    ? !currentPanel.content.explorerProps.freezeView
                    : undefined,
                ignoreViewByDefault: isBoolean(currentPanel.content.explorerProps.freezeView)
                    ? currentPanel.content.explorerProps.freezeView
                    : undefined,
                hideTableHeader: isBoolean(currentPanel.content.explorerProps.showSearch)
                    ? currentPanel.content.explorerProps.showSearch
                    : undefined,
                creationFormId: currentPanel.content.explorerProps.creationFormId,
                editionFormId: currentPanel.content.explorerProps.creationFormId
            };

            if ('libraryId' in currentPanel.content) {
                const libraryExplorerProps: {noPagination?: true} = {
                    noPagination: currentPanel.content.explorerProps.noPagination ?? undefined
                };

                if (currentPanel.content.libraryId === '<props>') {
                    return (
                        <div className={explorerContainer}>
                            <Explorer
                                entrypoint={{
                                    type: 'library',
                                    libraryId: currentWorkspace.entrypoint.libraryId
                                }}
                                itemActions={itemActions}
                                {...commonExplorerProps}
                                {...libraryExplorerProps}
                            />
                        </div>
                    );
                }
                return (
                    <div className={explorerContainer}>
                        <Explorer
                            entrypoint={{type: 'library', libraryId: currentPanel.content.libraryId}}
                            itemActions={itemActions}
                            {...commonExplorerProps}
                            {...libraryExplorerProps}
                        />
                    </div>
                );
            }
            return (
                <div className={explorerContainer}>
                    <Explorer
                        entrypoint={{
                            type: 'link',
                            linkAttributeId: currentPanel.content.attributeSource,
                            parentLibraryId: currentWorkspace.entrypoint.libraryId,
                            parentRecordId: searchParams.get(recordSearchParamsName)
                        }}
                        itemActions={itemActions}
                        {...commonExplorerProps}
                    />
                </div>
            );
        }
    }

    if ('children' in currentPanel) {
        return (
            <Navigate to={generatePath(routes.panel, {panelId: currentPanel.children.at(0)?.id}) + search} replace />
        );
    }

    return null; // TODO: this case should not happen
};
