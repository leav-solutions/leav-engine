import {KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {type HistoryData} from '../../types';
import {CopyButton} from '../../../ui/button/CopyButton';
import {
    historyDetailsRawJsonContainer,
    historyDetailsRawJsonField,
    historyDetailsRawJsonScrollable,
    historyDetailsRawJsonScrollableContent,
} from './historyDetailsRawJson.module.css';
import JsonView from '@uiw/react-json-view';
import {nordTheme} from '@uiw/react-json-view/nord';
import {type CSSProperties} from 'react';

type HistoryDetailsRawJsonProps = {
    historyData: HistoryData;
};

export const HistoryDetailsRawJson = ({historyData}: HistoryDetailsRawJsonProps) => {
    const {t} = useTranslation();

    return (
        <div className={historyDetailsRawJsonContainer}>
            <span className={historyDetailsRawJsonField}>
                <KitTypography.Text size="fontSize5" weight="bold">
                    {t('logs.open-history-details.json_full')}
                </KitTypography.Text>
                <CopyButton
                    title={t('logs.open-history-details.json_full')}
                    value={historyData.rawJson}
                    iconColor="var(--general-utilities-disabled)"
                />
            </span>
            <div className={historyDetailsRawJsonScrollable}>
                {/** Note: https://uiwjs.github.io/react-json-view/ for more information about this component */}
                <JsonView
                    className={historyDetailsRawJsonScrollableContent}
                    value={JSON.parse(historyData.rawJson)}
                    style={nordTheme as CSSProperties}
                    enableClipboard={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                />
            </div>
        </div>
    );
};
