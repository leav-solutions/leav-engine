// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDivider, KitModal} from 'aristid-ds';
import {type HistoryData} from '../get-history-data/useGetHistoryData';
import {useTranslation} from 'react-i18next';
import {HistoryDetailsHeader} from './header/HistoryDetailsHeader';
import {HistoryBeforeAfterComparator} from './before-after-comparator/HistoryBeforeAfterComparator';
import {historyDetailsModalContainer} from './historyDetailsModal.module.css';
import {HistoryDetailsRawJson} from './raw-json/HistoryDetailsRawJson';

type HistoryDetailsModalProps = {
    isOpen: boolean;
    historyData: HistoryData;
    onClose: () => void;
};

export const HistoryDetailsModal = ({isOpen, historyData, onClose}: HistoryDetailsModalProps) => {
    const {t} = useTranslation();

    if (!isOpen) {
        return null;
    }

    return (
        <KitModal
            width="50vw"
            height="80vh"
            isOpen
            close={onClose}
            title={t('logs.details.title')}
            appElement={document.getElementById('root')}
            destroyOnClose
            showCloseIcon
        >
            <div className={historyDetailsModalContainer}>
                <HistoryDetailsHeader historyData={historyData} />
                <HistoryBeforeAfterComparator historyData={historyData} />
                <KitDivider noMargin />
                <HistoryDetailsRawJson historyData={historyData} />
            </div>
        </KitModal>
    );
};
