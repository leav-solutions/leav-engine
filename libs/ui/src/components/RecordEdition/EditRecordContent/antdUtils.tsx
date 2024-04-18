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

const getInheritedValue = values => values.find(value => value.isInherited);
const getNotInheritedValue = values => values.find(value => !value.isInherited && value.raw_value !== null);

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

        const value = getNotInheritedValue(values) || getInheritedValue(values) || null;

        if (isRecordFormElementsValueLinkValue(value, attribute)) {
            acc[attribute.id] = value?.linkValue?.id;
            return acc;
        }

        if (isRecordFormElementsValueLinkValues(values, attribute)) {
            acc[attribute.id] = values.map(val => val?.linkValue?.id ?? undefined);
            return acc;
        }

        const fieldValue = value as RecordFormElementsValueStandardValue;
        if (attribute.format === AttributeFormat.text) {
            acc[attribute.id] = fieldValue?.raw_value ?? '';
        }

        if (attribute.format === AttributeFormat.date_range) {
            if (!fieldValue?.raw_value) {
                return acc;
            }

            if (hasDateRangeValues(fieldValue.raw_value)) {
                acc[attribute.id] = [
                    dayjs.unix(Number(fieldValue.raw_value.from)),
                    dayjs.unix(Number(fieldValue.raw_value.to))
                ];
            } else if (typeof fieldValue.raw_value === 'string') {
                const convertedFieldValue = JSON.parse(fieldValue.raw_value);
                acc[attribute.id] = [
                    dayjs.unix(Number(convertedFieldValue.from)),
                    dayjs.unix(Number(convertedFieldValue.to))
                ];
            }
        }

        return acc;
    }, {});
