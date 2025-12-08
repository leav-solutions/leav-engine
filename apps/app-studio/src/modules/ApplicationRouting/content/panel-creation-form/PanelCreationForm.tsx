// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
    const {recordId, where, recordPanelId} = useParams();

    const {currentPanel} = retrievePanelDetails({application, recordPanelId});
    const {saveValues} = useExecuteSaveValueBatchMutation();

    const {previousRecordId} = useGetPreviousPanelParams({
        currentRecordId: recordId,
        currentWhere: where,
        currentRecordPanelId: recordPanelId,
    });

    return (
        <EditRecordPage
            showRefreshButton={false}
            showHeader={false}
            record={null}
            creationFormId={formId}
            library={libraryId}
            isSubmitButtonsPortal
            onCreate={async ({id: recordIdCreated}) => {
                if (previousRecordId) {
                    await saveValues(
                        {
                            id: recordIdCreated,
                            library: {
                                id: libraryId,
                            },
                        },
                        [
                            {
                                attribute: (currentPanel as CreationFormPanel).attributeSource,
                                idValue: null,
                                value: previousRecordId,
                            },
                        ],
                    );
                }
                navigate(RelativePaths.closeCurrentPanel, {relative: 'path'});
            }}
        />
    );
};
