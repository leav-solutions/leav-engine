// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useEffect, useState} from 'react';
import {EditRecordPage} from '@leav/ui';
import {Panel} from '_ui/hooks/useIFrameMessenger/types';
import type {AddPanel, Workspace} from '../../types';
import {SIDEBAR_CONTENT_ID} from '../../../../constants';
import {PanelCustom} from './PanelCustom';
import {PanelLibraryExplorer} from './PanelLibraryExplorer';
import {PanelAttributeExplorer} from './PanelAttributeExplorer';

interface IPanelContentProps {
    /**
     * This panel should always contain only `content`. The `children` case is managed above in `<PanelsNavigationMenu />`.
     */
    panel: Panel;
    workspace: Workspace;
    addPanel: AddPanel;
    recordId: string | null;
}

export const PanelContent: FunctionComponent<IPanelContentProps> = ({panel, workspace, addPanel, recordId}) => {
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
                        id: recordId,
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
                    title={panel.id}
                    addPanel={addPanel}
                    recordId={recordId}
                />
            );
        }
        if (panel.content.type === 'explorer') {
            if ('attributeSource' in panel.content) {
                return (
                    <PanelAttributeExplorer
                        libraryId={panel.content.libraryId}
                        attributeSource={panel.content.attributeSource}
                        viewId={panel.content.viewId}
                        explorerProps={panel.content.explorerProps}
                        actions={panel.content.actions}
                        recordId={recordId}
                    />
                );
            }
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
    }

    return null; // TODO: this case should not happen
};
