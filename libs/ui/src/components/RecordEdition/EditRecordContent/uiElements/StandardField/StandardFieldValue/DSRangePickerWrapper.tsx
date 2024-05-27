// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitDatePicker} from 'aristid-ds';
import {FunctionComponent, ReactNode} from 'react';
import {IStandardFieldReducerState} from '../../../reducers/standardFieldReducer/standardFieldReducer';
import {Form} from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {IProvidedByAntFormItem, StandardValueTypes} from '../../../_types';
import {RangePickerProps} from 'antd/lib/date-picker';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface IDSRangePickerWrapperProps extends IProvidedByAntFormItem<RangePickerProps> {
    state: IStandardFieldReducerState;
    infoButton: ReactNode;
    handleSubmit: (value: StandardValueTypes, id?: string) => void;
}

const KitDatePickerRangePickerStyled = styled(KitDatePicker.RangePicker)<{$shouldHighlightColor: boolean}>`
    color: ${({$shouldHighlightColor}) =>
        $shouldHighlightColor ? 'var(--general-colors-primary-primary400)' : 'initial'};
    .kit-input-wrapper-helper {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
`;

export const DSRangePickerWrapper: FunctionComponent<IDSRangePickerWrapperProps> = ({
    state,
    infoButton,
    value,
    onChange,
    handleSubmit
}) => {
    const {t} = useSharedTranslation();

    const {errors} = Form.Item.useStatus();

    const _handleDateChange: (
        rangePickerDates: [from: dayjs.Dayjs, to: dayjs.Dayjs] | null,
        antOnChangeParams: [from: string, to: string] | null
    ) => void = (rangePickerDates, ...antOnChangeParams) => {
        if (state.isInheritedValue && rangePickerDates === null) {
            onChange(
                [
                    dayjs.unix(Number(state.inheritedValue.raw_value.from)),
                    dayjs.unix(Number(state.inheritedValue.raw_value.to))
                ],
                state.inheritedValue.raw_value
            );
            handleSubmit('', state.attribute.id);
            return;
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

    return (
        <KitDatePickerRangePickerStyled
            value={value}
            onChange={_handleDateChange}
            label={state.formElement.settings.label}
            required={state.formElement.settings.required}
            disabled={state.isReadOnly}
            allowClear={!state.isInheritedNotOverrideValue}
            status={errors.length > 0 ? 'error' : undefined}
            infoIcon={infoButton}
            onInfoClick={Boolean(infoButton) ? () => void 0 : undefined}
            helper={
                state.isInheritedOverrideValue
                    ? t('record_edition.inherited_input_helper', {
                          inheritedValue: t('record_edition.date_range_from_to', {
                              from: state.inheritedValue.value.from,
                              to: state.inheritedValue.value.to
                          })
                      })
                    : undefined
            }
            $shouldHighlightColor={state.isInheritedNotOverrideValue}
        />
    );
};
