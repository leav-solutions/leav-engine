// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ComponentProps, type FunctionComponent, useEffect, useState} from 'react';
import {EditRecordPage} from '@leav/ui';
import {type Panel} from '_ui/hooks/useIFrameMessenger/types';
import {FLAP_TARGET_ID} from '../../../constants';
import {PanelCustom} from './PanelCustom';
import {PanelLibraryExplorer} from './PanelLibraryExplorer';
import {PanelAttributeExplorer} from './PanelAttributeExplorer';

interface IPanelContentProps {
    panel: Panel;
    recordId: string | null;
    libraryId: string | null;
}

export const PanelContent: FunctionComponent<IPanelContentProps> = ({panel, recordId, libraryId}) => {
    const [sidebarContainer, setSidebarContainer] = useState<HTMLElement>();

    useEffect(() => {
        const element = document.getElementById(FLAP_TARGET_ID);
        if (element) {
            setSidebarContainer(element);
        }
    }, []);

    const commonFormProps: Partial<ComponentProps<typeof EditRecordPage>> = {
        showRefreshButton: false,
        showHeader: false,
        sidebarContainer
    };
    if (panel.type === 'creationForm') {
        return <EditRecordPage {...commonFormProps} record={null} creationFormId={panel.formId} library={libraryId} />;
    }
    if (panel.type === 'editionForm') {
        return (
            <EditRecordPage
                {...commonFormProps}
                record={{
                    id: recordId,
                    library: {
                        id: libraryId
                    }
                }}
                editionFormId={panel.formId}
                library={libraryId}
            />
        );
    }
    if (panel.type === 'custom') {
        return <PanelCustom source={panel.iframeSource} title={panel.id} recordId={recordId} />;
    }
    if (panel.type === 'explorer') {
        if ('attributeSource' in panel) {
            return (
                <PanelAttributeExplorer
                    libraryId={panel.libraryId}
                    attributeSource={panel.attributeSource}
                    viewId={panel.viewId}
                    explorerProps={panel.explorerProps}
                    actions={panel.actions}
                    recordId={recordId}
                />
            );
        }
        return (
            <PanelLibraryExplorer
                libraryId={libraryId}
                viewId={panel.viewId}
                explorerProps={panel.explorerProps}
                actions={panel.actions}
            />
        );
    }

    throw new Error(`Panel type '${(panel as any).type}' is not supported!`);
};
