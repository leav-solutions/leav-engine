// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {AttributeFormat, LogAction} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitSpace, KitTypography} from 'aristid-ds';
import dayjs from 'dayjs';
import {FunctionComponent} from 'react';
import {LogEntry, LogEntryAttribute, LogEntryData, LogEntryValue} from './_types';

interface IRecordHistoryLogEntryProps {
    index: number;
    logEntry: LogEntry;
}

export const RecordHistoryLogEntry: FunctionComponent<IRecordHistoryLogEntryProps> = ({index, logEntry}) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();
    const {action, time, user, topic, before, after} = logEntry as LogEntryValue;
    const attribute: LogEntryAttribute | undefined = topic?.attribute;

    const hasValue = (value: LogEntryData) => value != null && 'asString' in value && value.asString != null;
    const hasBefore = hasValue(before);
    const hasAfter = hasValue(after);

    const getUserString = () => {
        const email = user?.properties[0]?.values[0]?.payload;
        return email ? (
            <a href={`mailto:${email}`} style={{textDecoration: 'underline'}}>
                {email}
            </a>
        ) : (
            user?.id || t('record_history.unknown_user')
        );
    };
    const getDateString = () => dayjs.unix(time).format('DD/MM/YYYY HH:mm:ss'); // Maybe use https://day.js.org/docs/en/display/format#localized-formats if needed
    const getActionString = () => {
        if (attribute?.multiple_values) {
            if (!hasBefore && hasAfter) {
                return t('record_history.action.value_add');
            }
            if (hasBefore && !hasAfter) {
                return t('record_history.action.value_delete');
            }
        }
        return t('record_history.action.value_modify');
    };

    const getAttributeLabel = () =>
        localizedTranslation(attribute?.label, lang) || attribute?.id || t('record_history.unknown_attribute');

    const formatValue = (logData: LogEntryData) => {
        if (attribute?.format === AttributeFormat.rich_text) {
            return (
                <KitTypography.AdvancedParagraph size="fontSize7" ellipsis={{rows: 4, expandable: true}}>
                    {logData.asString}
                </KitTypography.AdvancedParagraph>
            );
        }
        return <KitTypography.Text size="fontSize7">{logData.asString}</KitTypography.Text>;
    };

    const formatValueChange = () => {
        const noValue = <KitTypography.Text size="fontSize7">{t('record_history.no_value')}</KitTypography.Text>;

        if (attribute?.multiple_values) {
            const uniqValue = !hasBefore && hasAfter ? after : hasBefore && !hasAfter ? before : null;
            if (uniqValue != null) {
                return (
                    <KitSpace size="xxs" direction="horizontal" wrap>
                        {formatValue(uniqValue)}
                    </KitSpace>
                );
            }
        }

        return (
            <KitSpace size="xxs" direction="horizontal" wrap>
                {hasBefore ? formatValue(before) : noValue}
                <KitTypography.Text size="fontSize7"> → </KitTypography.Text>
                {hasAfter ? formatValue(after) : noValue}
            </KitSpace>
        );
    };

    switch (action) {
        case LogAction.VALUE_SAVE:
        case LogAction.VALUE_DELETE:
            return (
                <KitSpace key={index} size="none" direction="vertical">
                    <KitTypography.Text size="fontSize7">
                        {getUserString()} {getActionString()} <strong>{getAttributeLabel()}</strong>
                    </KitTypography.Text>
                    <KitTypography.Text size="fontSize7">{getDateString()}</KitTypography.Text>
                    {formatValueChange()}
                </KitSpace>
            );
    }
};

export default RecordHistoryLogEntry;
