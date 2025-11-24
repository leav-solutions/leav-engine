// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useParams} from 'react-router-dom';
import {KitDivider} from 'aristid-ds';
import {retrievePanelDetails} from '../ApplicationRouting/utils/retrievePanelDetails';
import {InformationAndHistoryHeader} from './InformationAndHistoryHeader';
import {
    informationAndHistoryContainer,
    informationAndHistoryContentContainer,
    informationAndHistoryDivider,
} from './informationAndHistory.module.css';
import {RecordInformation} from './record-information/RecordInformation';
import {RecordHistoryContainer} from './record-history/RecordHistoryContainer';
import {useApplicationSettingsContext} from '../../config/application-instance/application-settings/useApplicationSettingsContext';

export const InformationAndHistory = () => {
    const [application] = useApplicationSettingsContext();
    const {workspaceId, panelId, recordId, where, recordPanelId} = useParams();
    const {libraryId} = retrievePanelDetails({application, recordPanelId});

    return (
        <div className={informationAndHistoryContainer}>
            <InformationAndHistoryHeader />
            <div className={informationAndHistoryContentContainer}>
                <RecordInformation recordId={recordId} libraryId={libraryId} />
                <KitDivider className={informationAndHistoryDivider} />
                <RecordHistoryContainer recordId={recordId} libraryId={libraryId} />
            </div>
        </div>
    );
};
