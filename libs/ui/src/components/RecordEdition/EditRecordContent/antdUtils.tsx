// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    IRecordForm,
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
const getNotInheritedOrOverrideValue = values => values.find(value => !value.isInherited && value.raw_payload !== null);

const getUserInputValue = values =>
    values.find(value => !value.isInherited && !value.isCalculated && value.raw_value !== null);

const isRecordFormElementsValueLinkValue = (
    value: RecordFormElementsValue,
    attribute: IRecordForm['elements'][0]['attribute']
): value is RecordFormElementsValueLinkValue =>
    attribute.type === AttributeType.simple_link ||
    (attribute.type === AttributeType.advanced_link && attribute.multiple_values === false);

const isRecordFormElementsValueLinkValues = (
    values: RecordFormElementsValue[],
    attribute: IRecordForm['elements'][0]['attribute']
): values is RecordFormElementsValueLinkValue[] =>
    attribute.type === AttributeType.advanced_link && attribute.multiple_values === true;

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

        const standardValue = value as RecordFormElementsValueStandardValue;

        if (!standardValue?.raw_payload) {
            if (attribute.format === AttributeFormat.date_range) {
                return acc;
            }

            acc[attribute.id] = '';
            return acc;
        }

        switch (attribute.format) {
            case AttributeFormat.color:
            case AttributeFormat.text:
            case AttributeFormat.rich_text:
            case AttributeFormat.boolean:
                acc[attribute.id] = standardValue.raw_payload;
                break;
            case AttributeFormat.numeric:
                acc[attribute.id] = Number(standardValue.raw_payload);
                break;
            case AttributeFormat.date:
                acc[attribute.id] = dayjs.unix(Number(standardValue.raw_payload));
                break;
            case AttributeFormat.date_range:
                if (hasDateRangeValues(standardValue.raw_payload)) {
                    acc[attribute.id] = [
                        dayjs.unix(Number(standardValue.raw_payload.from)),
                        dayjs.unix(Number(standardValue.raw_payload.to))
                    ];
                    break;
                } else if (typeof standardValue.raw_payload === 'string') {
                    const convertedFieldValue = JSON.parse(standardValue.raw_payload) as any;
                    acc[attribute.id] = [
                        dayjs.unix(Number(convertedFieldValue.from)),
                        dayjs.unix(Number(convertedFieldValue.to))
                    ];
                    break;
                }
        }

        return acc;
    }, {});
