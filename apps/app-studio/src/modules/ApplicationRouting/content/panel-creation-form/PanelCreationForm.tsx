import {type FunctionComponent} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import type * as z from 'zod/v4';
import {type creationPanelSchema, EditRecordPage, useExecuteSaveValueBatchMutation} from '@leav/ui';
import {RelativePaths} from '../../router/paths';
import {retrievePanelDetails} from '../../utils/retrievePanelDetails';
import {useApplicationSettingsContext} from '../../../../config/application-instance/application-settings/useApplicationSettingsContext';
import {useGetPreviousPanelParams} from './useGetPreviousPanelParams';

type CreationFormPanel = z.infer<typeof creationPanelSchema>;

interface IPanelCreationFormProps {
    formId: string;
    libraryId: string;
}

export const PanelCreationForm: FunctionComponent<IPanelCreationFormProps> = ({formId, libraryId}) => {
    const navigate = useNavigate();
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();

    const {currentPanel} = retrievePanelDetails({application, recordPanelId}) as {currentPanel: CreationFormPanel};
    const {saveValues} = useExecuteSaveValueBatchMutation();

    const currentWorkspace = application.workspaces.find(({id}) => id === workspaceId);

    const {previousRecordId: previousRecordIdFromParams} = useGetPreviousPanelParams({
        currentRecordId: recordId,
        currentWhere: where,
        currentRecordPanelId: recordPanelId,
    });

    let previousRecordId = previousRecordIdFromParams;
    if (!previousRecordIdFromParams && currentWorkspace.type === 'record') {
        previousRecordId = currentWorkspace.recordId;
    }

    return (
        <EditRecordPage
            showRefreshButton={false}
            showHeader={false}
            record={null}
            creationFormId={formId}
            library={libraryId}
            isSubmitButtonsPortal
            onCreate={async ({id: recordIdCreated}) => {
                if (currentPanel?.attributeSource && previousRecordId) {
                    await saveValues(
                        {
                            id: recordIdCreated,
                            library: {
                                id: libraryId,
                            },
                        },
                        [
                            {
                                attribute: currentPanel.attributeSource,
                                idValue: null,
                                value: previousRecordId,
                            },
                        ],
                    );
                }
                navigate(RelativePaths.closeCurrentPanel, {relative: 'path'});
            }}
            removePadding
        />
    );
};
