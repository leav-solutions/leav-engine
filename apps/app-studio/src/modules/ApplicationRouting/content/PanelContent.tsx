// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent, useEffect, useState} from 'react';
import {EditRecordPage} from '@leav/ui';
import {type Panel} from '_ui/hooks/useIFrameMessenger/types';
import {FLAP_FULLPAGE_TARGET_ID} from '../../../constants';
import {PanelCustom} from './panel-custom/PanelCustom';
import {PanelLibraryExplorer} from './panel-explorer/PanelLibraryExplorer';
import {PanelAttributeExplorer} from './panel-explorer/PanelAttributeExplorer';
import {PanelCreationForm} from './panel-creation-form/PanelCreationForm';

interface IPanelContentProps {
    panel: Panel;
    recordId: string | null;
    libraryId: string | null;
}

export const PanelContent: FunctionComponent<IPanelContentProps> = ({panel, recordId, libraryId}) => {
    const [sidebarContainer, setSidebarContainer] = useState<HTMLElement>();

    useEffect(() => {
        const element = document.getElementById(FLAP_FULLPAGE_TARGET_ID);
        if (element) {
            setSidebarContainer(element);
        }
    }, []);

    if (panel.type === 'creationForm') {
        return <PanelCreationForm libraryId={libraryId} formId={panel.formId} />;
    }
    if (panel.type === 'editionForm') {
        return (
            <EditRecordPage
                key={`${recordId}-${panel.formId}`}
                showRefreshButton={false}
                showHeader={false}
                sidebarContainer={sidebarContainer}
                record={{
                    id: recordId,
                    library: {
                        id: libraryId,
                    },
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
                    libraryIdSource={panel.libraryId}
                    attributeSource={panel.attributeSource}
                    deactivateOnUnlink={panel.deactivateOnUnlink}
                    viewId={panel.viewId}
                    explorerProps={panel.explorerProps}
                    actions={panel.actions}
                    recordId={recordId}
                    libraryId={libraryId}
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
