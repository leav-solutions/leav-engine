// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDatePicker} from 'aristid-ds';
import {FunctionComponent, useRef, useState} from 'react';
import {Form} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {setDateToUTCNoon} from '_ui/_utils';
import {IStandFieldValueContentProps} from './_types';
import {IKitDatePicker} from 'aristid-ds/dist/Kit/DataEntry/DatePicker/types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EMPTY_INITIAL_VALUE_STRING} from '../../../antdUtils';

const KitDatePickerStyled = styled(KitDatePicker)`
    width: 100%;
`;

export const DSDatePickerWrapper: FunctionComponent<IStandFieldValueContentProps<IKitDatePicker>> = ({
    value,
    presentationValue,
    isLastValueOfMultivalues,
    removeLastValueOfMultivalues,
    onChange,
    attribute,
    handleSubmit,
    readonly,
    calculatedFlags,
    inheritedFlags
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

    const _resetToInheritedOrCalculatedValue = async () => {
        hasChangedRef.current = false;

        if (inheritedFlags.isInheritedValue) {
            onChange(
                dayjs.unix(Number(inheritedFlags.inheritedValue.raw_payload)),
                inheritedFlags.inheritedValue.raw_payload
            );
        } else if (calculatedFlags.isCalculatedValue) {
            onChange(
                dayjs.unix(Number(calculatedFlags.calculatedValue.raw_payload)),
                calculatedFlags.calculatedValue.raw_payload
            );
        }

        await handleSubmit(null, attribute.id);
    };

    const _handleDateChange: (
        datePickerDate: dayjs.Dayjs | null,
        antOnChangeParams: string | string[]
    ) => void = async (datePickerDate, ...antOnChangeParams) => {
        hasChangedRef.current = true;

        if ((inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue) && datePickerDate === null) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (!!datePickerDate) {
            datePickerDate = setDateToUTCNoon(datePickerDate);
        }

        onChange(datePickerDate, ...antOnChangeParams);

        // TODO : validate form with await form.validateFields(attribute.id)

        let dateToSave = '';
        if (!!datePickerDate) {
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

    return (
        <KitDatePickerStyled
            id={attribute.id}
            autoFocus={isFocused}
            open={attribute.multiple_values ? isFocused : undefined}
            value={value}
            format={isFocused || isErrors || !presentationValue ? undefined : () => presentationValue}
            disabled={readonly}
            allowClear={!inheritedFlags.isInheritedNotOverrideValue && !calculatedFlags.isCalculatedNotOverrideValue}
            helper={isErrors ? String(errors[0]) : undefined}
            status={isErrors ? 'error' : undefined}
            onChange={_handleDateChange}
            onFocus={() => setIsFocused(true)}
            onOpenChange={_handleOpenChange}
            placeholder={t('record_edition.placeholder.enter_a_date')}
        />
    );
};
