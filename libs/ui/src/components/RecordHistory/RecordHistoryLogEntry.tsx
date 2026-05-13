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
import {
    getExtendedAttributeDiffs,
    getExtendedAttributeLabels,
} from '_ui/components/RecordHistory/utils/extendedAttribute';

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
    const isKnownAttribute = (attr: typeof attribute): attr is Extract<typeof attribute, {multiple_values: boolean}> =>
        attr != null && 'multiple_values' in attr;

    const getUserString = () => {
        const email = user && 'properties' in user ? user.properties[0]?.values[0]?.payload : null;
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
        if (isKnownAttribute(attribute) && attribute.multiple_values) {
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
        if (
            isKnownAttribute(attribute) &&
            (attribute.format === AttributeFormat.rich_text || attribute.format === AttributeFormat.extended)
        ) {
            return (
                <KitTypography.AdvancedParagraph size="fontSize5" ellipsis={{rows: 4, expandable: true}}>
                    {logData.asString}
                </KitTypography.AdvancedParagraph>
            );
        }
        return <KitTypography.Text size="fontSize5">{logData.asString}</KitTypography.Text>;
    };

    const formatValueChange = () => {
        const noValue = <KitTypography.Text size="fontSize5">{t('record_history.no_value')}</KitTypography.Text>;

        if (isKnownAttribute(attribute) && attribute.format === AttributeFormat.extended) {
            const diffs = getExtendedAttributeDiffs(
                hasValue(before) ? JSON.parse(before.asString) : undefined,
                hasValue(after) ? JSON.parse(after.asString) : undefined,
            );

            return diffs.map(diff => (
                <KitSpace size="xxs" direction="horizontal" wrap>
                    {getExtendedAttributeLabels(
                        diff.path,
                        (attribute as RecordHistoryLogAttributeStandardAttributeFragment)
                            .embedded_fields as IEmbeddedField[],
                        lang,
                        t('record_history.unknown_attribute'),
                    )
                        .reverse()
                        .map((key, i, arr) => (
                            <span key={key}>
                                <strong>{key}</strong>
                                {i < arr.length - 1 && ` ${t('record_history.of')}`}
                            </span>
                        ))}
                    :{diff.before !== null ? formatValue({asString: diff.before}) : noValue}
                    <KitTypography.Text size="fontSize5">→</KitTypography.Text>
                    {diff.after !== null ? formatValue({asString: diff.after}) : noValue}
                </KitSpace>
            ));
        }

        if (isKnownAttribute(attribute) && attribute.multiple_values) {
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
