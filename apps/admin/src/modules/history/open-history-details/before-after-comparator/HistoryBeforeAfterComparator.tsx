// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDivider, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {
    historyBeforeAfterComparatorContainer,
    historyBeforeAfterComparatorBlock,
} from './historyBeforeAfterComparator.module.css';
import {type HistoryData} from '../../types';

type HistoryBeforeAfterComparatorProps = {
    historyData: HistoryData;
};

export const HistoryBeforeAfterComparator = ({historyData}: HistoryBeforeAfterComparatorProps) => {
    const {t} = useTranslation();

    const fields = [
        {labelKey: 'logs.open-history-details.before', value: historyData.before},
        {labelKey: 'logs.open-history-details.after', value: historyData.after},
    ];

    return (
        <div className={historyBeforeAfterComparatorContainer}>
            {fields.map(({labelKey, value}) => (
                <div className={historyBeforeAfterComparatorBlock}>
                    <KitTypography.Text size="fontSize5" weight="bold">
                        {t(labelKey)}
                    </KitTypography.Text>
                    <KitDivider noMargin />
                    <KitTypography.Text size="fontSize5" weight="bold">
                        {value || '—'}
                    </KitTypography.Text>
                </div>
            ))}
        </div>
    );
};
