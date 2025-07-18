// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useEffect, useState} from 'react';
import {generatePath, Navigate, useLocation} from 'react-router-dom';
import {EditRecordPage} from '@leav/ui';
import type {AddPanel, Workspace} from '../../types';
import {recordSearchParamsName, routes} from '../../routes';
import {SIDEBAR_CONTENT_ID} from '../../../../constants';
import {PanelCustom} from './PanelCustom';
import {PanelLibraryExplorer} from './PanelLibraryExplorer';
import {PanelAttributeExplorer} from './PanelAttributeExplorer';
import {Panel} from '_ui/hooks/useIFrameMessenger/types';

interface IPanelContentProps {
    panel: Panel;
    workspace: Workspace;
    addPanel: AddPanel;
}

export const PanelContent: FunctionComponent<IPanelContentProps> = ({panel, workspace, addPanel}) => {
    const {search} = useLocation();
    const searchParams = new URLSearchParams(search);
    const [sidebarContainer, setSidebarContainer] = useState<HTMLElement>();

    useEffect(() => {
        const element = document.getElementById(SIDEBAR_CONTENT_ID);
        if (element) {
            setSidebarContainer(element);
        }
    }, []);

    if ('content' in panel) {
        const commonFormProps: Partial<ComponentProps<typeof EditRecordPage>> = {
            showRefreshButton: false,
            showHeader: false,
            sidebarContainer
        };
        if (panel.content.type === 'creationForm') {
            return (
                <EditRecordPage
                    {...commonFormProps}
                    record={null}
                    creationFormId={panel.content.formId}
                    library={panel.content.libraryId}
                />
            );
        }
        if (panel.content.type === 'editionForm') {
            return (
                <EditRecordPage
                    {...commonFormProps}
                    record={{
                        id: searchParams.get(recordSearchParamsName),
                        library: {
                            id: panel.content.libraryId
                        }
                    }}
                    editionFormId={panel.content.formId}
                    library={panel.content.libraryId}
                />
            );
        }
        if (panel.content.type === 'custom') {
            return (
                <PanelCustom
                    source={panel.content.iframeSource}
                    searchQuery={search}
                    title={panel.id}
                    addPanel={addPanel}
                />
            );
        }
        if (panel.content.type === 'explorer') {
            if ('libraryId' in panel.content) {
                if (panel.content.libraryId === '<props>') {
                    return (
                        <PanelLibraryExplorer
                            libraryId={workspace.entrypoint.libraryId}
                            viewId={panel.content.viewId}
                            explorerProps={panel.content.explorerProps}
                            actions={panel.content.actions}
                        />
                    );
                }
                return (
                    <PanelLibraryExplorer
                        libraryId={panel.content.libraryId}
                        viewId={panel.content.viewId}
                        explorerProps={panel.content.explorerProps}
                        actions={panel.content.actions}
                    />
                );
            }
            return (
                <PanelAttributeExplorer
                    libraryId={panel.content.libraryId}
                    attributeSource={panel.content.attributeSource}
                    viewId={panel.content.viewId}
                    explorerProps={panel.content.explorerProps}
                    actions={panel.content.actions}
                />
            );
        }
    }

    if ('children' in panel) {
        return <Navigate to={generatePath(routes.panel, {panelId: panel.children.at(0)?.id}) + search} replace />;
    }

    return null; // TODO: this case should not happen
};
