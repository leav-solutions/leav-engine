// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ChangeEvent, FocusEvent, FunctionComponent, useEffect, useMemo, useRef, useState} from 'react';
import {KitSelect} from 'aristid-ds';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {
    AttributeFormat,
    RecordFormAttributeFragment,
    RecordFormAttributeLinkAttributeFragment,
    RecordFormAttributeStandardAttributeFragment,
    StandardValuesListFragmentStandardDateRangeValuesListConfFragment,
    StandardValuesListFragmentStandardStringValuesListConfFragment
} from '_ui/_gqlTypes';
import {Form, GetRef, SelectProps} from 'antd';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';
import {
    IStandardFieldReducerState,
    IStandardFieldValue,
    StandardFieldValueState
} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/standardFieldReducer';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import {IValueOfValuesList} from './ValuesList';
import moment from 'moment';
import {stringifyDateRangeValue} from '_ui/_utils';

// const ResultsCount = styled(KitTypography.Text)`
//     margin-bottom: calc(var(--general-spacing-s) * 1px);
// `;

interface IMonoValueSelectProps extends IProvidedByAntFormItem<SelectProps> {
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeStandardAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

export const MonoValueSelect: FunctionComponent<IMonoValueSelectProps> = ({
    value,
    onChange,
    state,
    attribute,
    fieldValue,
    handleSubmit,
    handleBlur,
    shouldShowValueDetailsButton = false
}) => {
    if (!onChange) {
        throw Error('MonoValueSelect should be used inside a antd Form.Item');
    }

    if (!attribute.values_list || attribute.values_list.enable === false) {
        throw Error('MonoValueSelect should have a values list');
    }

    const {t} = useSharedTranslation();
    const {errors} = Form.Item.useStatus();
    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: fieldValue?.value,
        attribute
    });
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const {lang: availableLang} = useLang();
    const selectRef = useRef<GetRef<typeof KitSelect>>(null);

    useEffect(() => {
        if (fieldValue.isEditing && selectRef.current) {
            selectRef.current.focus();
            setIsSelectOpen(true);
        }
    }, [fieldValue.isEditing]);

    type IStringValuesListConf = StandardValuesListFragmentStandardStringValuesListConfFragment;
    type IDateRangeValuesListConf = StandardValuesListFragmentStandardDateRangeValuesListConfFragment;

    const _getFilteredValuesList = () => {
        let values = [];

        if (attribute.format === AttributeFormat.date_range) {
            const valuesList = (attribute.values_list as IDateRangeValuesListConf).dateRangeValues ?? [];

            values = valuesList.map(v => {
                const rangeValue = {
                    from: moment(Number(v.from) * 1000).format('L'),
                    to: moment(Number(v.to) * 1000).format('L')
                };
                return {
                    value: stringifyDateRangeValue(rangeValue, t),
                    label: {from: v.from, to: v.to}
                };
            });
        } else {
            const valuesList = (attribute.values_list as IStringValuesListConf)?.values ?? [];

            values = valuesList.map(v => ({value: v, label: v}));
        }

        return values;
    };

    const options = _getFilteredValuesList();

    const _resetToInheritedOrCalculatedValue = () => {
        if (state.isInheritedValue) {
            onChange(state.inheritedValue.raw_value, options);
        } else if (state.isCalculatedValue) {
            onChange(state.calculatedValue.raw_value, options);
        }
        handleSubmit('', state.attribute.id);
    };

    const _handleOnBlur = () => {
        handleBlur();
        setIsSelectOpen(false);
    };

    const _handleOnChange = (selectedValue: string) => {
        setIsSelectOpen(false);
        if ((state.isInheritedValue || state.isCalculatedValue) && selectedValue === '') {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        handleSubmit(selectedValue, state.attribute.id);
        onChange(selectedValue, options);
    };

    const _handleOnClear = () => {
        handleSubmit('', state.attribute.id);
        _handleOnBlur();
    };

    const helper = useMemo(() => {
        if (state.isInheritedOverrideValue) {
            return t('record_edition.inherited_input_helper', {
                inheritedValue: state.inheritedValue.raw_value
            });
        } else if (state.isCalculatedOverrideValue) {
            return t('record_edition.calculated_input_helper', {
                calculatedValue: state.calculatedValue.raw_value
            });
        }
        return '';
    }, [state.isInheritedOverrideValue, state.isCalculatedOverrideValue]);

    const label = localizedTranslation(state.formElement.settings.label, availableLang);

    return (
        <KitSelect
            ref={selectRef}
            open={isSelectOpen}
            value={value}
            required={state.formElement.settings.required}
            label={label}
            options={options}
            status={errors.length > 0 && 'error'}
            showSearch
            helper={helper}
            onSelect={_handleOnChange}
            onChange={onChange}
            onClear={_handleOnClear}
            onBlur={_handleOnBlur}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            // dropdownRender={menu => {
            //     if (loading) {
            //         return menu;
            //     }

            //     return (
            //         <>
            //             <ResultsCount weight="bold">
            //                 {optionsType === 'search'
            //                     ? t('record_edition.link_search_result_count', {
            //                           count:
            //                               searchResultCount > suggestionsCount ? suggestionsCount : searchResultCount,
            //                           total: searchResultCount
            //                       })
            //                     : t('record_edition.suggestions_count', {count: suggestionsCount})}
            //             </ResultsCount>
            //             {menu}
            //         </>
            //     );
            // }}
        />
    );
};
