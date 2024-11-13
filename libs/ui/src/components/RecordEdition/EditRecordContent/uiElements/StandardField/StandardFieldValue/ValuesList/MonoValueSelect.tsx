// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useMemo, useRef, useState} from 'react';
import {KitSelect, KitTypography} from 'aristid-ds';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {AttributeFormat, useSaveAttributeMutation} from '_ui/_gqlTypes';
import {Form, GetRef} from 'antd';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';
import {useLang} from '_ui/hooks';
import {localizedTranslation} from '@leav/utils';
import moment from 'moment';
import {stringifyDateRangeValue} from '_ui/_utils';
import {IDateRangeValuesListConf, IMonoValueSelectProps, IStringValuesListConf} from './_types';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';

interface IOption {
    label: string;
    value: string;
}

const isNewOption = (value: string, options: IOption[]): boolean =>
    value !== '' && !options.find(option => option.value === value);

const addOption = (options: IOption[], optionToAdd: IOption) => {
    const newOptions = options;
    if (optionToAdd.value && isNewOption(optionToAdd.value, options)) {
        newOptions.unshift({
            value: optionToAdd.value,
            label: optionToAdd.label
        });
    }
    return newOptions;
};

export const MonoValueSelect: FunctionComponent<IMonoValueSelectProps> = ({
    value,
    onChange,
    state,
    editRecordDispatch,
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
    const [searchedString, setSearchedString] = useState('');
    const {lang: availableLang} = useLang();
    const selectRef = useRef<GetRef<typeof KitSelect>>(null);
    const [saveAttribute] = useSaveAttributeMutation();
    const allowFreeEntry = attribute.values_list.allowFreeEntry;
    const allowListUpdate = attribute.values_list.allowListUpdate;

    useEffect(() => {
        if (fieldValue.isEditing && selectRef.current) {
            selectRef.current.focus();
            setIsSelectOpen(true);
        }
    }, [fieldValue.isEditing]);

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

    const initialOptions = _getFilteredValuesList();
    let options = [...initialOptions];
    if (allowFreeEntry) {
        options = addOption(options, {value, label: value});
        options = addOption(options, {
            value: searchedString,
            label:
                (allowListUpdate ? t('record_edition.create_option') : t('record_edition.select_option')) +
                searchedString
        });
    }

    const searchResultsCount = useMemo(
        () => options.filter(option => option.label.toLowerCase().includes(searchedString.toLowerCase())).length,
        [searchedString]
    );

    const _resetToInheritedOrCalculatedValue = () => {
        if (state.isInheritedValue) {
            setTimeout(() => onChange(state.inheritedValue.raw_value, options), 0);
        } else if (state.isCalculatedValue) {
            setTimeout(() => onChange(state.calculatedValue.raw_value, options), 0);
        }
        handleSubmit('', attribute.id);
    };

    const _handleOnBlur = () => {
        handleBlur();
        setIsSelectOpen(false);
    };

    const _handleOnChange = async (selectedValue: string) => {
        setIsSelectOpen(false);
        setSearchedString('');
        if ((state.isInheritedValue || state.isCalculatedValue) && selectedValue === '') {
            _resetToInheritedOrCalculatedValue();
            return;
        }

        if (allowListUpdate && isNewOption(selectedValue, initialOptions) && 'values' in attribute.values_list) {
            await saveAttribute({
                variables: {
                    attribute: {
                        id: attribute.id,
                        values_list: {
                            enable: true,
                            allowFreeEntry: true,
                            allowListUpdate: true,
                            values: [...attribute.values_list.values, selectedValue]
                        }
                    }
                }
            });
            editRecordDispatch({type: EditRecordReducerActionsTypes.REQUEST_REFRESH});
        }

        handleSubmit(selectedValue, attribute.id);
        onChange(selectedValue, options);
    };

    const _handleOnClear = () => {
        _handleOnChange('');
        handleBlur();
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
    const required = state.formElement.settings.required;

    return (
        <KitSelect
            ref={selectRef}
            data-testid={attribute.id}
            open={isSelectOpen}
            value={value}
            required={required}
            allowClear={!required}
            label={label}
            options={options}
            status={errors.length > 0 && 'error'}
            showSearch
            helper={helper}
            onSelect={_handleOnChange}
            onChange={onChange}
            onClear={_handleOnClear}
            onBlur={_handleOnBlur}
            onSearch={setSearchedString}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            dropdownRender={menu => (
                <>
                    {searchedString !== '' && searchResultsCount > 0 && (
                        <div style={{paddingBottom: 'calc(var(--general-spacing-xs) * 1px)'}}>
                            <KitTypography.Text size="fontSize7">
                                {t('record_edition.press_enter_to')}
                            </KitTypography.Text>
                            <KitTypography.Text size="fontSize7" weight="medium">
                                {t('record_edition.select_this_value')}
                            </KitTypography.Text>
                        </div>
                    )}
                    {menu}
                </>
            )}
            notFoundContent={
                <div style={{textAlign: 'center'}}>
                    <KitTypography.Text size="fontSize5" weight="medium">
                        {t('record_edition.search_not_found')}
                    </KitTypography.Text>
                </div>
            }
        />
    );
};
