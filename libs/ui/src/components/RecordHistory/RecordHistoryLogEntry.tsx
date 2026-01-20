// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {AttributeFormat, LogAction, type RecordHistoryLogAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitSpace, KitTypography} from 'aristid-ds';
import dayjs from 'dayjs';
import {type FunctionComponent} from 'react';
import {type LogEntry, type LogEntryAttribute, type LogEntryData, type LogEntryValue} from './_types';
import styled from 'styled-components';
import {type IEmbeddedField} from '_ui/components/RecordHistory/_queries/recordHistoryQuery';

interface IRecordHistoryLogEntryProps {
    index: number;
    logEntry: LogEntry;
}

const StyledLinkButton = styled(KitButton)`
    &[role='link'] {
        display: inline-flex;
    }
`;

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
            <StyledLinkButton type="link" href={`mailto:${email}`}>
                {email}
            </StyledLinkButton>
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
                <KitTypography.AdvancedParagraph size="fontSize5" ellipsis={{rows: 4, expandable: true}}>
                    {logData.asString}
                </KitTypography.AdvancedParagraph>
            );
        }
        return <KitTypography.Text size="fontSize5">{logData.asString}</KitTypography.Text>;
    };

    const _getExtendedAttributeDiffs = (
        extendedValueBefore: unknown | undefined,
        extendedValueAfter: unknown | undefined,
        path: string[] = [],
        diffs: Array<{path: string; before: any; after: any}> = [],
    ): Array<{path: string; before: unknown; after: unknown}> => {
        if (
            typeof extendedValueBefore !== 'object' ||
            extendedValueBefore === null ||
            typeof extendedValueAfter !== 'object' ||
            extendedValueAfter === null
        ) {
            if (extendedValueBefore !== extendedValueAfter) {
                diffs.push({path: path.join('.'), before: extendedValueBefore, after: extendedValueAfter});
            }

            return diffs;
        }

        const keys = new Set([...Object.keys(extendedValueBefore || {}), ...Object.keys(extendedValueAfter || {})]);
        for (const key of keys) {
            _getExtendedAttributeDiffs(extendedValueBefore?.[key], extendedValueAfter?.[key], [...path, key], diffs);
        }

        return diffs;
    };

    const _getExtendedAttributeLabels = (path: string, embeddedFields: IEmbeddedField[]): string[] => {
        let nestedEmbeddedFields = [...embeddedFields];
        let current: IEmbeddedField = null;
        const labels: string[] = [];

        for (const id of path.split('.')) {
            current = nestedEmbeddedFields.find(attr => attr.id === id);
            if (!current) {
                break;
            }
            labels.push(
                localizedTranslation(current?.label, lang) || current?.id || t('record_history.unknown_attribute'),
            );
            nestedEmbeddedFields = current.embedded_fields ?? [];
        }

        return labels;
    };

    const formatValueChange = () => {
        const noValue = <KitTypography.Text size="fontSize5">{t('record_history.no_value')}</KitTypography.Text>;

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

        if (attribute?.format === AttributeFormat.extended) {
            const diffs = _getExtendedAttributeDiffs(
                hasValue(before) ? JSON.parse(before.asString) : undefined,
                hasValue(after) ? JSON.parse(after.asString) : undefined,
            );

            return diffs.map(diff => (
                <KitSpace size="xxs" direction="horizontal" wrap>
                    {_getExtendedAttributeLabels(
                        diff.path,
                        (attribute as RecordHistoryLogAttributeStandardAttributeFragment)
                            .embedded_fields as IEmbeddedField[],
                    )
                        .reverse()
                        .map((key, i, arr) => (
                            <span key={key}>
                                <strong>{key}</strong>
                                {i < arr.length - 1 && ` ${t('record_history.of')}`}
                            </span>
                        ))}
                    :{diff.before !== undefined ? formatValue({asString: diff.before as string}) : noValue}
                    <KitTypography.Text size="fontSize5">→</KitTypography.Text>
                    {diff.after !== undefined ? formatValue({asString: diff.after as string}) : noValue}
                </KitSpace>
            ));
        }

        return (
            <KitSpace size="xxs" direction="horizontal" wrap>
                {hasBefore ? formatValue(before) : noValue}
                <KitTypography.Text size="fontSize5">→</KitTypography.Text>
                {hasAfter ? formatValue(after) : noValue}
            </KitSpace>
        );
    };

    switch (action) {
        case LogAction.VALUE_SAVE:
        case LogAction.VALUE_DELETE:
            return (
                <KitSpace key={index} size="xxs" direction="vertical">
                    <KitTypography.Text size="fontSize5">
                        {getUserString()} {getActionString()} <strong>{getAttributeLabel()}</strong>
                    </KitTypography.Text>
                    <KitTypography.Text size="fontSize5">{getDateString()}</KitTypography.Text>
                    {formatValueChange()}
                </KitSpace>
            );
    }
};

export default RecordHistoryLogEntry;
