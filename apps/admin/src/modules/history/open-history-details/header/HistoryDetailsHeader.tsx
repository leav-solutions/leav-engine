import {KitTypography} from 'aristid-ds';
import {
    historyDetailsHeaderContainer,
    historyDetailsHeaderField,
    historyDetailsHeaderFieldWrapper,
} from './historyDetailsHeader.module.css';
import {useTranslation} from 'react-i18next';
import {type HistoryData} from '../../types';
import {CopyButton} from '../../../ui/button/CopyButton';

type HistoryDetailsHeaderProps = {
    historyData: HistoryData;
};

export const HistoryDetailsHeader = ({historyData}: HistoryDetailsHeaderProps) => {
    const {t} = useTranslation();

    const fields = [
        {labelKey: 'logs.open-history-details.date', value: historyData.date},
        {labelKey: 'logs.open-history-details.user', value: historyData.user},
        {labelKey: 'logs.open-history-details.action', value: historyData.action},
        {labelKey: 'logs.open-history-details.object', value: historyData.object},
        {labelKey: 'logs.open-history-details.entity', value: historyData.entity},
        {labelKey: 'logs.open-history-details.open-history-details', value: historyData.details},
        {labelKey: 'logs.open-history-details.query_id', value: historyData.queryId, copyable: true},
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
