// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useEffect, useState} from 'react';
import {generatePath, Navigate, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {EditRecordPage, Explorer} from '@leav/ui';
import {FaPlus} from 'react-icons/all';
import type {IApplicationMatchingContext} from './types';
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
            const {actions, type, viewId, ...explorerProps} = currentPanel.content;
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

            if ('libraryId' in explorerProps) {
                const {libraryId, ...restExplorerProps} = explorerProps;
                if (explorerProps.libraryId === '<props>') {
                    return (
                        <div className={explorerContainer}>
                            <Explorer
                                entrypoint={{
                                    type: 'library',
                                    libraryId: currentWorkspace.entrypoint.libraryId
                                }}
                                itemActions={itemActions}
                                {...restExplorerProps}
                                defaultViewSettings={{
                                    viewId
                                }}
                            />
                        </div>
                    );
                }
                return (
                    <div className={explorerContainer}>
                        <Explorer
                            entrypoint={{type: 'library', libraryId}}
                            itemActions={itemActions}
                            {...restExplorerProps}
                            defaultViewSettings={{
                                viewId
                            }}
                        />
                    </div>
                );
            }
            const {attributeSource, ...restExplorerProps} = explorerProps;
            return (
                <div className={explorerContainer}>
                    <Explorer
                        entrypoint={{
                            type: 'link',
                            linkAttributeId: attributeSource,
                            parentLibraryId: currentWorkspace.entrypoint.libraryId,
                            parentRecordId: searchParams.get(recordSearchParamsName)
                        }}
                        {...restExplorerProps}
                        defaultViewSettings={{
                            viewId
                        }}
                        itemActions={itemActions}
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
