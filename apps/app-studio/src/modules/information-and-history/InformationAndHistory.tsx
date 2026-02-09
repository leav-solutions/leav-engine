// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useParams} from 'react-router-dom';
import {KitDivider} from 'aristid-ds';
import {InformationAndHistoryHeader} from './InformationAndHistoryHeader';
import {
    informationAndHistoryContainer,
    informationAndHistoryContentContainer,
    informationAndHistoryDivider,
} from './informationAndHistory.module.css';
import {RecordInformation} from './record-information/RecordInformation';
import {RecordHistoryContainer} from './record-history/RecordHistoryContainer';
import cn from 'classnames';

export const InformationAndHistory = () => {
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId} = useParams();

    return (
        <div className={cn('informationAndHistory', informationAndHistoryContainer)}>
            <InformationAndHistoryHeader />
            <div className={informationAndHistoryContentContainer}>
                <RecordInformation recordId={flapRecordId} libraryId={flapLibraryId} />
                <KitDivider className={informationAndHistoryDivider} />
                <RecordHistoryContainer recordId={flapRecordId} libraryId={flapLibraryId} />
            </div>
        </div>
    );
};
