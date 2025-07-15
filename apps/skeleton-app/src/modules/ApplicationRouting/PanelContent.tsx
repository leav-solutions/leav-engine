// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useEffect, useState} from 'react';
import {generatePath, Navigate, useLocation, useOutletContext} from 'react-router-dom';
import {EditRecordPage} from '@leav/ui';
import type {AddPanel, IApplicationMatchingContext} from './types';
import {recordSearchParamsName, routes} from './routes';
import {SIDEBAR_CONTENT_ID} from '../../constants';
import {PanelCustom} from './PanelCustom';
import {PanelLibraryExplorer} from './PanelLibraryExplorer';
import {PanelAttributeExplorer} from './PanelAttributeExplorer';
import {findPanelById} from './utils';

interface IPanelContentProps {
    panelId: string;
    addPanel: AddPanel;
    recordId?: string;
    searchQuery?: string;
}

export const PanelContent: FunctionComponent<IPanelContentProps> = ({panelId, addPanel, recordId, searchQuery}) => {
    // const {search} = useLocation(); //TODO: A voir si on garde ici ou pas
    const {currentWorkspace} = useOutletContext<Omit<IApplicationMatchingContext, 'currentParentTuple'>>();

    const [sidebarContainer, setSidebarContainer] = useState<HTMLElement>();
    useEffect(() => {
        const element = document.getElementById(SIDEBAR_CONTENT_ID);
        if (element) {
            setSidebarContainer(element);
        }
    }, []);

    //TODO: Just for now, to match old naming
    const currentPanel = findPanelById(currentWorkspace.panels, panelId);

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
                        id: recordId,
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
                <PanelCustom
                    source={currentPanel.content.iframeSource}
                    searchQuery={searchQuery}
                    title={currentPanel.id}
                    addPanel={addPanel}
                />
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
            <Navigate
                to={generatePath(routes.panel, {panelId: currentPanel.children.at(0)?.id}) + searchQuery}
                replace
            />
        );
    }

    return null; // TODO: this case should not happen
};
