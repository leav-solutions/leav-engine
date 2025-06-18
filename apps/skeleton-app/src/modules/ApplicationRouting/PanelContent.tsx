// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useEffect, useState} from 'react';
import {generatePath, Navigate, useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import {EditRecordPage, Explorer} from '@leav/ui';
import type {IApplicationMatchingContext} from './types';
import {recordSearchParamsName, routes} from './routes';
import {SIDEBAR_CONTENT_ID} from '../../constants';
import {PanelCustom} from './PanelCustom';

import {explorerContainer} from './PanelContent.module.css';
import {PanelLibraryExplorer} from './PanelLibraryExplorer';
import {PanelAttributeExplorer} from './PanelAttributeExplorer';

export const PanelContent: FunctionComponent = () => {
    const {search} = useLocation();
    const searchParams = new URLSearchParams(search);
    const {currentPanel, currentWorkspace} =
        useOutletContext<Omit<IApplicationMatchingContext, 'currentParentTuple'>>();

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
            if ('libraryId' in currentPanel.content) {
                if (currentPanel.content.libraryId === '<props>') {
                    return (
                        <PanelLibraryExplorer
                            libraryId={currentWorkspace.entrypoint.libraryId}
                            viewId={currentPanel.content.viewId}
                            explorerProps={currentPanel.content.explorerProps}
                            actions={currentPanel.content.actions}
                        />
                    );
                }
                return (
                    <PanelLibraryExplorer
                        libraryId={currentPanel.content.libraryId}
                        viewId={currentPanel.content.viewId}
                        explorerProps={currentPanel.content.explorerProps}
                        actions={currentPanel.content.actions}
                    />
                );
            }
            return (
                <PanelAttributeExplorer
                    libraryId={currentWorkspace.entrypoint.libraryId}
                    attributeSource={currentPanel.content.attributeSource}
                    viewId={currentPanel.content.viewId}
                    explorerProps={currentPanel.content.explorerProps}
                    actions={currentPanel.content.actions}
                />
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
