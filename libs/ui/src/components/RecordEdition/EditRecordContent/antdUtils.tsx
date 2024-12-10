// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    IRecordForm,
    RecordFormElementAttribute,
    RecordFormElementsValue,
    RecordFormElementsValueLinkValue,
    RecordFormElementsValueStandardValue
} from '_ui/hooks/useGetRecordForm';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {IDateRangeValue} from '@leav/utils';
import {Store} from 'antd/lib/form/interface';
import dayjs from 'dayjs';

const hasDateRangeValues = (dateRange: unknown): dateRange is IDateRangeValue =>
    (dateRange as IDateRangeValue).from !== undefined && (dateRange as IDateRangeValue).to !== undefined;

const getCalculatedValue = values => values.find(value => value.isCalculated);

const getInheritedValue = values => values.find(value => value.isInherited);

const getUserInputValue = values =>
    values.find(value => !value.isInherited && !value.isCalculated && value.raw_value !== null);

const isRecordFormElementsValueLinkValue = (
    value: RecordFormElementsValue,
    attribute: RecordFormElementAttribute
): value is RecordFormElementsValueLinkValue =>
    attribute.type === AttributeType.simple_link ||
    (attribute.type === AttributeType.advanced_link && attribute.multiple_values === false);

const isRecordFormElementsValueLinkValues = (
    values: RecordFormElementsValue[],
    attribute: RecordFormElementAttribute
): values is RecordFormElementsValueLinkValue[] =>
    attribute.type === AttributeType.advanced_link && attribute.multiple_values === true;

const isRecordFormElementsMultipleValuesList = (attribute: RecordFormElementAttribute) =>
    attribute.type === AttributeType.advanced &&
    attribute.multiple_values === true &&
    'values_list' in attribute &&
    attribute.values_list?.enable;

const isRecordFormElementsMultipleValues = (attribute: RecordFormElementAttribute) =>
    attribute.type === AttributeType.advanced && attribute.multiple_values === true;

const formatStandardInitialValue = (
    standardValue: RecordFormElementsValueStandardValue,
    attribute: RecordFormElementAttribute
) => {
    if (!standardValue?.raw_payload) {
        return getEmptyInitialValue(attribute);
    }

    switch (attribute.format) {
        case AttributeFormat.color:
        case AttributeFormat.text:
        case AttributeFormat.rich_text:
        case AttributeFormat.boolean:
            return standardValue.raw_payload;
        case AttributeFormat.numeric:
            return Number(standardValue.raw_payload);
        case AttributeFormat.date:
            return dayjs.unix(Number(standardValue.raw_payload));
        case AttributeFormat.date_range:
            if (hasDateRangeValues(standardValue.raw_payload)) {
                return [
                    dayjs.unix(Number(standardValue.raw_payload.from)),
                    dayjs.unix(Number(standardValue.raw_payload.to))
                ];
            } else if (typeof standardValue.raw_payload === 'string') {
                const convertedFieldValue = JSON.parse(standardValue.raw_payload) as any;
                return [dayjs.unix(Number(convertedFieldValue.from)), dayjs.unix(Number(convertedFieldValue.to))];
            }
    }
};

export const getEmptyInitialValue = (attribute: RecordFormElementAttribute) => {
    if ([AttributeFormat.date_range, AttributeFormat.color].includes(attribute.format)) {
        return undefined;
    }
    return '';
};

export const getAntdFormInitialValues = (recordForm: IRecordForm) =>
    recordForm.elements.reduce<Store>((acc, {attribute, values}) => {
        if (!attribute) {
            return acc;
        }

        const value = getUserInputValue(values) ?? getInheritedValue(values) ?? getCalculatedValue(values) ?? null;

        if (isRecordFormElementsValueLinkValue(value, attribute)) {
            acc[attribute.id] = value?.linkValue?.id;
            return acc;
        }

        if (isRecordFormElementsValueLinkValues(values, attribute)) {
            acc[attribute.id] = values.map(val => val?.linkValue?.id ?? undefined);
            return acc;
        }

        if (isRecordFormElementsMultipleValuesList(attribute)) {
            const valuesWithoutCalculatedOrInherited = values.filter(val => val.id_value);
            acc[attribute.id] =
                valuesWithoutCalculatedOrInherited.length === 0
                    ? []
                    : valuesWithoutCalculatedOrInherited
                          .sort((a, b) => Number(a.id_value) - Number(b.id_value))
                          .map(val => formatStandardInitialValue(val, attribute));
            return acc;
        }

        if (isRecordFormElementsMultipleValues(attribute)) {
            const valuesWithoutCalculatedOrInherited = values.filter(val => val.id_value);
            acc[attribute.id] =
                valuesWithoutCalculatedOrInherited.length === 0
                    ? [getEmptyInitialValue(attribute)]
                    : valuesWithoutCalculatedOrInherited
                          .sort((a, b) => Number(a.id_value) - Number(b.id_value))
                          .map(val => formatStandardInitialValue(val, attribute));
            return acc;
        }

        const standardValue = value as RecordFormElementsValueStandardValue;

        acc[attribute.id] = formatStandardInitialValue(standardValue, attribute);

        return acc;
    }, {});
