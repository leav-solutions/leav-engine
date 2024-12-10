// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useMemo, useState} from 'react';
import {KitSelect, KitTypography} from 'aristid-ds';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {AttributeFormat, useSaveAttributeMutation} from '_ui/_gqlTypes';
import {Form} from 'antd';
import moment from 'moment';
import {stringifyDateRangeValue} from '_ui/_utils';
import {IDateRangeValuesListConf, IStringValuesListConf} from './_types';
import {EditRecordReducerActionsTypes} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {IStandFieldValueContentProps} from '../_types';
import {IKitSelect} from 'aristid-ds/dist/Kit/DataEntry/Select/types';

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

export const MonoValueSelect: FunctionComponent<IStandFieldValueContentProps<IKitSelect>> = ({
    value,
    presentationValue,
    onChange,
    attribute,
    required,
    readonly,
    handleSubmit,
    handleDeselect,
    handleDeleteAllValues,
    inheritedFlags,
    calculatedFlags
}) => {
    if (!onChange) {
        throw Error('MonoValueSelect should be used inside a antd Form.Item');
    }

    if (!attribute.values_list || attribute.values_list.enable === false) {
        throw Error('MonoValueSelect should have a values list');
    }

    const {t} = useSharedTranslation();
    const {errors} = Form.Item.useStatus();
    const [isFocused, setIsFocused] = useState(false);
    const [searchedString, setSearchedString] = useState('');
    const [saveAttribute] = useSaveAttributeMutation();
    const {dispatch: editRecordDispatch} = useEditRecordReducer();

    const allowFreeEntry = attribute.values_list.allowFreeEntry;
    const allowListUpdate = attribute.values_list.allowListUpdate;
    const emptyValue = attribute.multiple_values ? [] : '';

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
        if (Array.isArray(value)) {
            value.map(val => (options = addOption(options, {value: val as string, label: val as string})));
        } else {
            options = addOption(options, {value, label: value});
        }
        options = addOption(options, {
            value: searchedString,
            label:
                (allowListUpdate ? t('record_edition.create_and_select_option') : t('record_edition.select_option')) +
                searchedString
        });
    }

    const searchResultsCount = useMemo(
        () => options.filter(option => option.label.toLowerCase().includes(searchedString.toLowerCase())).length,
        [searchedString]
    );

    const _resetToInheritedOrCalculatedValue = async () => {
        if (inheritedFlags.isInheritedValue) {
            setTimeout(() => onChange(inheritedFlags.inheritedValue.raw_value, options), 0);
        } else if (calculatedFlags.isCalculatedValue) {
            setTimeout(() => onChange(calculatedFlags.calculatedValue.raw_value, options), 0);
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleOnSelect = async (selectedValue: string) => {
        setSearchedString('');
        if ((inheritedFlags.isInheritedValue || calculatedFlags.isCalculatedValue) && selectedValue === '') {
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

        await handleSubmit(selectedValue, attribute.id);
    };

    const _handleOnDeselect = (deselectValue: string) => handleDeselect(deselectValue, attribute.id);

    const _handleOnClear = async () => {
        console.log('_handleOnClear');
        if (attribute.multiple_values) {
            await handleDeleteAllValues();
        } else {
            await handleSubmit('');
        }
        onChange(emptyValue, options);
    };

    const _handleOnSearch = async (search: string) => {
        setSearchedString(search);
        if (search) {
            setIsFocused(true);
        }
    };

    const valueToDisplay = isFocused ? value : presentationValue;
    const isValueEmpty = value === '';

    return (
        <KitSelect
            id={attribute.id}
            data-testid={attribute.id}
            value={value}
            allowClear={!required && value}
            disabled={readonly}
            options={options}
            open={isFocused}
            status={errors.length > 0 && 'error'}
            mode={attribute.multiple_values ? 'tags' : undefined}
            showSearch
            onDropdownVisibleChange={visible => console.log('renal - visible : ', visible) || setIsFocused(visible)}
            onSelect={_handleOnSelect}
            onChange={onChange}
            onClear={_handleOnClear}
            onSearch={_handleOnSearch}
            onDeselect={_handleOnDeselect}
            placeholder={t('record_edition.placeholder.select_an_option')}
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
