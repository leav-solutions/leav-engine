import {KitDatePicker} from 'aristid-ds';
import {type FunctionComponent, useEffect, useRef, useState} from 'react';
import {Form} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {type StandardValueTypes} from '../../../_types';
import {setDateToUTCNoon} from '_ui/_utils';
import {type IStandFieldValueContentProps} from './_types';
import {type IKitRangePicker} from 'aristid-ds/dist/Kit/DataEntry/DatePicker/types';
import {useDateFormat} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EMPTY_INITIAL_VALUE_UNDEFINED} from '../../../antdUtils';

const KitDatePickerRangePickerStyled = styled(KitDatePicker.RangePicker)<{
    $shouldMergeEmptyFields: boolean;
}>`
    ${({$shouldMergeEmptyFields}) =>
        $shouldMergeEmptyFields &&
        `   &.ant-picker.ant-picker-range {
            div:nth-child(n+3) {
                display: none;
            }
        }
        `}
`;

export const DSRangePickerWrapper: FunctionComponent<IStandFieldValueContentProps<IKitRangePicker>> = ({
    value,
    isLastValueOfMultivalues,
    removeLastValueOfMultivalues,
    onChange,
    attribute,
    handleSubmit,
    readonly,
    calculatedFlags,
    inheritedFlags,
}) => {
    if (!onChange) {
        throw Error('DSRangePickerWrapper should be used inside a antd Form.Item');
    }

    const isNewValueOfMultivalues = isLastValueOfMultivalues && value === EMPTY_INITIAL_VALUE_UNDEFINED;
    const focusedDefaultValue = attribute.multiple_values ? isNewValueOfMultivalues : false;

    const hasChangedRef = useRef(false);
    const [isFocused, setIsFocused] = useState(focusedDefaultValue);
    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const isErrors = errors.length > 0;
    const dateFormat = useDateFormat();

    // Merge the two empty inputs into one so the "enter a period" placeholder reads as a single field.
    // Slowed down via effect so the un-merged layout doesn't flash before being hidden.
    const [shouldMergeEmptyFields, setShouldMergeEmptyFields] = useState(false);
    useEffect(() => setShouldMergeEmptyFields(!isFocused && !isErrors && !value), [isFocused, isErrors, value]);

    // TODO: Remove inheritedValues[0] and calculatedValues[0] when we will have a proper way to override multiple values. For now, those attributes are set in readonly mode.
    const _resetToInheritedOrCalculatedValue = async () => {
        hasChangedRef.current = false;

        if (inheritedFlags.isInheritedValues) {
            onChange(
                [
                    dayjs.unix(Number(inheritedFlags.inheritedValues[0].raw_payload.from)),
                    dayjs.unix(Number(inheritedFlags.inheritedValues[0].raw_payload.to)),
                ],
                inheritedFlags.inheritedValues[0].raw_payload,
            );
        } else if (calculatedFlags.isCalculatedValues) {
            onChange(
                [
                    dayjs.unix(Number(calculatedFlags.calculatedValues[0].raw_payload.from)),
                    dayjs.unix(Number(calculatedFlags.calculatedValues[0].raw_payload.to)),
                ],
                calculatedFlags.calculatedValues[0].raw_payload,
            );
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleDateChange: (
        rangePickerDates: [from: dayjs.Dayjs, to: dayjs.Dayjs] | null,
        antOnChangeParams: [from: string, to: string] | null,
    ) => void = async (rangePickerDates, ...antOnChangeParams) => {
        hasChangedRef.current = true;

        if ((inheritedFlags.isInheritedValues || calculatedFlags.isCalculatedValues) && rangePickerDates === null) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (rangePickerDates) {
            rangePickerDates = [setDateToUTCNoon(rangePickerDates[0]), setDateToUTCNoon(rangePickerDates[1])];
        }

        onChange(rangePickerDates, ...antOnChangeParams);

        let datesToSave: StandardValueTypes = null;

        if (rangePickerDates !== null) {
            const [dateFrom, dateTo] = rangePickerDates;
            datesToSave = JSON.stringify({from: dateFrom.unix(), to: dateTo.unix()});
        }

        await handleSubmit(datesToSave, attribute.id);
    };

    const _handleOpenChange = (open: boolean) => {
        if (!open) {
            setIsFocused(false);

            if (!hasChangedRef.current && isNewValueOfMultivalues) {
                removeLastValueOfMultivalues();
            }
        }
    };

    const _handleOnFocus = () => {
        setIsFocused(true);
    };

    const placeholderToDisplay: IKitRangePicker['placeholder'] = isFocused
        ? [t('record_edition.placeholder.start_date'), t('record_edition.placeholder.end_date')]
        : [t('record_edition.placeholder.enter_a_period'), ''];

    return (
        <KitDatePickerRangePickerStyled
            id={attribute.id}
            autoFocus={isFocused}
            open={attribute.multiple_values ? isFocused : undefined}
            value={value}
            format={dateFormat}
            readonly={readonly}
            allowClear={
                !!value &&
                !attribute.multiple_values &&
                !inheritedFlags.isInheritedNotOverrideValues &&
                !calculatedFlags.isCalculatedNotOverrideValues
            }
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            onFocus={_handleOnFocus}
            onChange={_handleDateChange}
            onOpenChange={_handleOpenChange}
            placeholder={placeholderToDisplay}
            $shouldMergeEmptyFields={shouldMergeEmptyFields}
        />
    );
};
