// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txtx
import {RecordHistory} from '_ui/components';
import {recordHistoryTitle, recordHistoryContainer} from './recordHistory.module.css';
import {KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';

//TODO: This container might be removed when RecordHistory component will be moved to this module. It's current purpose is to provide styling and a subtitle
export const RecordHistoryContainer = ({recordId, libraryId}: {recordId: string; libraryId: string}) => {
    const {t} = useTranslation();

    return (
        <>
            <KitTypography.Text className={recordHistoryTitle} size="fontSize5" weight="bold">
                {t('information_and_history.history')}
            </KitTypography.Text>
            <div className={recordHistoryContainer}>
                <RecordHistory record={{id: recordId, library: {id: libraryId}}} />
            </div>
        </>
    );
};
