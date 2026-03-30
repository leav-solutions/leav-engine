// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTypography} from 'aristid-ds';
import {
    historyDetailsHeaderContainer,
    historyDetailsHeaderField,
    historyDetailsHeaderFieldWrapper,
} from './historyDetailsHeader.module.css';
import {useTranslation} from 'react-i18next';
import {type HistoryData} from '../../get-history-data/useGetHistoryData';
import {CopyButton} from '../../copy-button/CopyButton';

type HistoryDetailsHeaderProps = {
    historyData: HistoryData;
};

export const HistoryDetailsHeader = ({historyData}: HistoryDetailsHeaderProps) => {
    const {t} = useTranslation();

    const fields = [
        {labelKey: 'logs.details.date', value: historyData.date},
        {labelKey: 'logs.details.user', value: historyData.user},
        {labelKey: 'logs.details.action', value: historyData.action},
        {labelKey: 'logs.details.object', value: historyData.object},
        {labelKey: 'logs.details.entity', value: historyData.entity},
        {labelKey: 'logs.details.details', value: historyData.details},
        {labelKey: 'logs.details.query_id', value: historyData.queryId, copyable: true},
    ];

    return (
        <div className={historyDetailsHeaderContainer}>
            {fields.map(({labelKey, value, copyable}) => (
                <div key={labelKey} className={historyDetailsHeaderField}>
                    <span className={historyDetailsHeaderFieldWrapper}>
                        <KitTypography.Text size="fontSize6">{t(labelKey)}</KitTypography.Text>
                        {copyable && (
                            <CopyButton
                                title={t(labelKey)}
                                value={value}
                                iconColor="var(--general-utilities-disabled)"
                            />
                        )}
                    </span>
                    <KitTypography.Text size="fontSize6" weight="bold">
                        {value}
                    </KitTypography.Text>
                </div>
            ))}
        </div>
    );
};
