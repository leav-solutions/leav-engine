// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDatePicker} from 'aristid-ds';
import {FunctionComponent, useEffect, useRef, useState} from 'react';
import {Form} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {StandardValueTypes} from '../../../_types';
import {setDateToUTCNoon} from '_ui/_utils';
import {IStandFieldValueContentProps} from './_types';
import {IKitRangePicker} from 'aristid-ds/dist/Kit/DataEntry/DatePicker/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EMPTY_INITIAL_VALUE_UNDEFINED} from '../../../antdUtils';

const KitDatePickerRangePickerStyled = styled(KitDatePicker.RangePicker)<{
    $shouldUsePresentationLayout: boolean;
}>`
    ${({$shouldUsePresentationLayout}) =>
        $shouldUsePresentationLayout &&
        `   &.ant-picker.ant-picker-range {
                grid-template-columns: 28px 1fr 0px 0px 12px;

                .ant-picker-range-separator,
                .ant-picker-input:nth-of-type(0) {
                    display: none;
                }
            }
        `}
`;

export const DSRangePickerWrapper: FunctionComponent<IStandFieldValueContentProps<IKitRangePicker>> = ({
    value,
    presentationValue,
    isLastValueOfMultivalues,
    removeLastValueOfMultivalues,
    onChange,
    attribute,
    handleSubmit,
    readonly,
    calculatedFlags,
    inheritedFlags,
    setActiveValue
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

    // we slow down the css so that presentationValue does not flash before being hidden
    const [usePresentationLayout, setUsePresentationLayout] = useState(false);
    useEffect(() => setUsePresentationLayout(!isFocused && !isErrors), [isFocused, isErrors]);

    const _resetToInheritedOrCalculatedValue = async () => {
        hasChangedRef.current = false;

        if (inheritedFlags.isInheritedValue) {
            onChange(
                [
                    dayjs.unix(Number(inheritedFlags.inheritedValue.raw_payload.from)),
                    dayjs.unix(Number(inheritedFlags.inheritedValue.raw_payload.to))
                ],
                inheritedFlags.inheritedValue.raw_payload
            );
        } else if (calculatedFlags.isCalculatedValue) {
            onChange(
                [
                    dayjs.unix(Number(calculatedFlags.calculatedValue.raw_payload.from)),
                    dayjs.unix(Number(calculatedFlags.calculatedValue.raw_payload.to))
                ],
                calculatedFlags.calculatedValue.raw_payload
            );
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleDateChange: (
        rangePickerDates: [from: dayjs.Dayjs, to: dayjs.Dayjs] | null,
        antOnChangeParams: [from: string, to: string] | null
    ) => void = async (rangePickerDates, ...antOnChangeParams) => {
        hasChangedRef.current = true;

        if ((inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue) && rangePickerDates === null) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (rangePickerDates) {
            rangePickerDates = [setDateToUTCNoon(rangePickerDates[0]), setDateToUTCNoon(rangePickerDates[1])];
        }

        onChange(rangePickerDates, ...antOnChangeParams);

        // TODO : validate form with await form.validateFields(state.attribute.id)

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
        setActiveValue();
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
            format={!isFocused && !isErrors && !!presentationValue ? () => presentationValue : undefined}
            disabled={readonly}
            allowClear={!inheritedFlags.isInheritedNotOverrideValue && !calculatedFlags.isCalculatedNotOverrideValue}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            onFocus={_handleOnFocus}
            onChange={_handleDateChange}
            onOpenChange={_handleOpenChange}
            placeholder={placeholderToDisplay}
            $shouldUsePresentationLayout={usePresentationLayout}
        />
    );
};
