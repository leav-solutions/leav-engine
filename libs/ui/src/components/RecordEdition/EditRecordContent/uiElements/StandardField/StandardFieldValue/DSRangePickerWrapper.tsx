// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDatePicker} from 'aristid-ds';
import {FunctionComponent, useEffect, useRef} from 'react';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {IProvidedByAntFormItem, StandardValueTypes} from '../../../_types';
import {RangePickerProps} from 'antd/lib/date-picker';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {RecordFormAttributeFragment} from '_ui/_gqlTypes';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {setDateToUTCNoon} from '_ui/_utils';

interface IDSRangePickerWrapperProps extends IProvidedByAntFormItem<RangePickerProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: StandardValueTypes, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

const KitDatePickerRangePickerStyled = styled(KitDatePicker.RangePicker)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) => ($shouldHighlightColor ? 'var(--general-colors-primary-400)' : 'initial')};
`;

export const DSRangePickerWrapper: FunctionComponent<IDSRangePickerWrapperProps> = ({
    value,
    onChange,
    state,
    attribute,
    fieldValue,
    handleSubmit,
    handleBlur,
    shouldShowValueDetailsButton = false
}) => {
    const {t} = useSharedTranslation();
    const {lang: availableLangs} = useLang();
    const {errors} = Form.Item.useStatus();
    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute
    });

    const inputRef = useRef<any>();

    useEffect(() => {
        if (fieldValue.isEditing && inputRef.current) {
            inputRef.current.nativeElement.click(); // To automatically open the date picker
        }
    }, [fieldValue.isEditing]);

    const _resetToInheritedOrCalculatedValue = () => {
        if (state.isInheritedValue) {
            onChange(
                [
                    dayjs.unix(Number(state.inheritedValue.raw_value.from)),
                    dayjs.unix(Number(state.inheritedValue.raw_value.to))
                ],
                state.inheritedValue.raw_value
            );
        } else if (state.isCalculatedValue) {
            onChange(
                [
                    dayjs.unix(Number(state.calculatedValue.raw_value.from)),
                    dayjs.unix(Number(state.calculatedValue.raw_value.to))
                ],
                state.calculatedValue.raw_value
            );
        }
        handleSubmit('', state.attribute.id);
    };

    const _handleDateChange: (
        rangePickerDates: [from: dayjs.Dayjs, to: dayjs.Dayjs] | null,
        antOnChangeParams: [from: string, to: string] | null
    ) => void = (rangePickerDates, ...antOnChangeParams) => {
        if ((state.isInheritedValue || state.isCalculatedValue) && rangePickerDates === null) {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (rangePickerDates) {
            rangePickerDates = [setDateToUTCNoon(rangePickerDates[0]), setDateToUTCNoon(rangePickerDates[1])];
        }

        onChange(rangePickerDates, ...antOnChangeParams);

        // TODO : validate form with await form.validateFields(state.attribute.id)
        if (state.formElement.settings.required && rangePickerDates === null) {
            return;
        }

        const datesToSave = {from: null, to: null};
        if (rangePickerDates !== null) {
            const [dateFrom, dateTo] = rangePickerDates;

            datesToSave.from = String(dateFrom.unix());
            datesToSave.to = String(dateTo.unix());
        }

        handleSubmit(datesToSave, state.attribute.id);
    };

    const _handleOpenChange = (open: boolean) => {
        if (!open) {
            handleBlur();
        }
    };

    const _getHelper = () => {
        if (state.isInheritedOverrideValue) {
            return t('record_edition.inherited_input_helper', {
                inheritedValue: t('record_edition.date_range_from_to', {
                    from: state.inheritedValue.value.from,
                    to: state.inheritedValue.value.to
                })
            });
        } else if (state.isCalculatedOverrideValue) {
            return t('record_edition.calculated_input_helper', {
                calculatedValue: t('record_edition.date_range_from_to', {
                    from: state.calculatedValue.value.from,
                    to: state.calculatedValue.value.to
                })
            });
        }
        return;
    };

    const label = localizedTranslation(state.formElement.settings.label, availableLangs);

    return (
        <KitDatePickerRangePickerStyled
            // @ts-expect-error - ref is not a valid prop for RangePicker but works at runtime
            ref={inputRef}
            value={value}
            onChange={_handleDateChange}
            label={label}
            required={state.formElement.settings.required}
            disabled={state.isReadOnly}
            allowClear={!state.isInheritedNotOverrideValue && !state.isCalculatedNotOverrideValue}
            status={errors.length > 0 ? 'error' : undefined}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            onOpenChange={_handleOpenChange}
            helper={_getHelper()}
            $shouldHighlightColor={state.isInheritedNotOverrideValue || state.isCalculatedNotOverrideValue}
        />
    );
};
