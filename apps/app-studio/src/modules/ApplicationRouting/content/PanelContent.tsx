import {type FunctionComponent} from 'react';
import {EditRecordPage} from '@leav/ui';
import {type Panel} from '_ui/hooks/usePanelMessenger/types';
import {PanelCustom} from './panel-custom/PanelCustom';
import {PanelCustomCreation} from './panel-custom/PanelCustomCreation';
import {PanelLibraryExplorer} from './panel-explorer/PanelLibraryExplorer';
import {PanelAttributeExplorer} from './panel-explorer/PanelAttributeExplorer';
import {PanelCreationForm} from './panel-creation-form/PanelCreationForm';
import {PanelTreeExplorer} from './panel-tree-explorer/PanelTreeExplorer';

interface IPanelContentProps {
    panel: Panel;
    recordId: string | null;
    libraryId: string | null;
}

export const PanelContent: FunctionComponent<IPanelContentProps> = ({panel, recordId, libraryId}) => {
    if (panel.type === 'creationForm') {
        return <PanelCreationForm libraryId={libraryId} formId={panel.formId} />;
    }
    if (panel.type === 'customCreation') {
        return <PanelCustomCreation source={panel.iframeSource} title={panel.id} />;
    }
    if (panel.type === 'editionForm') {
        return (
            <EditRecordPage
                key={`${recordId}-${panel.formId}`}
                showRefreshButton={false}
                showHeader={false}
                record={{
                    id: recordId,
                    library: {
                        id: libraryId,
                    },
                }}
                editionFormId={panel.formId}
                library={libraryId}
                forceDisableSidebarInAppStudio
                removePadding
            />
        );
    }
    if (panel.type === 'custom') {
        return <PanelCustom source={panel.iframeSource} title={panel.id} recordId={recordId} />;
    }
    if (panel.type === 'treeExplorer') {
        return <PanelTreeExplorer treeId={panel.treeId} />;
    }
    if (panel.type === 'explorer') {
        if ('attributeSource' in panel) {
            return (
                <PanelAttributeExplorer
                    libraryIdSource={panel.libraryId}
                    attributeSource={panel.attributeSource}
                    deactivateOnUnlink={panel.deactivateOnUnlink}
                    explorerProps={panel.explorerProps}
                    actions={panel.actions}
                    recordId={recordId}
                    libraryId={libraryId}
                />
            );
        }
        return (
            <PanelLibraryExplorer libraryId={libraryId} explorerProps={panel.explorerProps} actions={panel.actions} />
        );
    }

    throw new Error(`Panel type '${(panel as any).type}' is not supported!`);
};
