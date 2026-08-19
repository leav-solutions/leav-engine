import {KitDatePicker} from 'aristid-ds';
import {type FunctionComponent, useRef, useState} from 'react';
import {Form} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {setDateToUTCNoon} from '_ui/_utils';
import {type IStandFieldValueContentProps} from './_types';
import {type IKitDatePicker} from 'aristid-ds/dist/Kit/DataEntry/DatePicker/types';
import {useDateFormat} from '_ui/hooks';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EMPTY_INITIAL_VALUE_STRING} from '../../../antdUtils';

const KitDatePickerStyled = styled(KitDatePicker)`
    width: 100%;
`;

export const DSDatePickerWrapper: FunctionComponent<IStandFieldValueContentProps<IKitDatePicker>> = ({
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
        throw Error('DSDatePickerWrapper should be used inside a antd Form.Item');
    }

    const isNewValueOfMultivalues =
        isLastValueOfMultivalues && typeof value === 'string' && value === EMPTY_INITIAL_VALUE_STRING;
    const focusedDefaultValue = attribute.multiple_values ? isNewValueOfMultivalues : false;

    const {errors} = Form.Item.useStatus();
    const {t} = useSharedTranslation();

    const hasChangedRef = useRef(false);
    const [isFocused, setIsFocused] = useState(focusedDefaultValue);
    const isErrors = errors.length > 0;
    const dateFormat = useDateFormat();

    // TODO: Remove inheritedValues[0] and calculatedValues[0] when we will have a proper way to override multiple values. For now, those attributes are set in readonly mode.
    const _resetToInheritedOrCalculatedValue = async () => {
        hasChangedRef.current = false;

        if (inheritedFlags.isInheritedValues) {
            onChange(
                dayjs.unix(Number(inheritedFlags.inheritedValues[0].raw_payload)),
                inheritedFlags.inheritedValues[0].raw_payload,
            );
        } else if (calculatedFlags.isCalculatedValues) {
            onChange(
                dayjs.unix(Number(calculatedFlags.calculatedValues[0].raw_payload)),
                calculatedFlags.calculatedValues[0].raw_payload,
            );
        }

        await handleSubmit(null, attribute.id);
    };

    const _handleDateChange: (
        datePickerDate: dayjs.Dayjs | dayjs.Dayjs[] | null,
        antOnChangeParams: string | string[],
    ) => void = async (rawDatePickerDate, ...antOnChangeParams) => {
        let datePickerDate = Array.isArray(rawDatePickerDate) ? (rawDatePickerDate[0] ?? null) : rawDatePickerDate;
        hasChangedRef.current = true;

        if ((inheritedFlags.isInheritedValues || calculatedFlags.isCalculatedValues) && datePickerDate === null) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (datePickerDate) {
            datePickerDate = setDateToUTCNoon(datePickerDate);
        }

        onChange(datePickerDate, ...antOnChangeParams);

        let dateToSave = '';
        if (datePickerDate) {
            dateToSave = String(datePickerDate.unix());
        }

        await handleSubmit(dateToSave, attribute.id);
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

    return (
        <KitDatePickerStyled
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
            onChange={_handleDateChange}
            onFocus={_handleOnFocus}
            onOpenChange={_handleOpenChange}
            placeholder={t('record_edition.placeholder.enter_a_date')}
        />
    );
};
