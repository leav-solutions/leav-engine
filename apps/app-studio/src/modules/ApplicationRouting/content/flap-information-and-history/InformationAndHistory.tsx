import {useRouteParams} from '../../router/useRouteParams';
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
    const {flapRecordId, flapLibraryId} = useRouteParams();

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
