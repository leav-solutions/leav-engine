// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {type HistoryData} from '../../get-history-data/useGetHistoryData';
import {CopyButton} from '../../copy-button/CopyButton';
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
                    {t('logs.details.json_full')}
                </KitTypography.Text>
                <CopyButton
                    title={t('logs.details.json_full')}
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
