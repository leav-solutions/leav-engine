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
