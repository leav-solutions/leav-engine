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
import {EMPTY_INITIAL_VALUE_STRING} from '_ui/components/RecordEdition/EditRecordContent/antdUtils';

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

export const DSListSelect: FunctionComponent<IStandFieldValueContentProps<IKitSelect>> = ({
    value,
    presentationValue,
    isLastValueOfMultivalues,
    removeLastValueOfMultivalues,
    onChange,
    attribute,
    required,
    readonly,
    handleSubmit,
    inheritedFlags,
    calculatedFlags,
    setActiveValue
}) => {
    if (!onChange) {
        throw Error('DSListSelect should be used inside a antd Form.Item');
    }

    if (!attribute.values_list || attribute.values_list.enable === false) {
        throw Error('DSListSelect should have a values list');
    }

    const isNewValueOfMultivalues = isLastValueOfMultivalues && value === EMPTY_INITIAL_VALUE_STRING;
    const focusedDefaultValue = attribute.multiple_values ? isNewValueOfMultivalues : false;

    const {t} = useSharedTranslation();
    const form = Form.useFormInstance();
    const {errors} = Form.Item.useStatus();
    const [hasChanged, setHasChanged] = useState(false);
    const [isFocused, setIsFocused] = useState(focusedDefaultValue);
    const [searchedString, setSearchedString] = useState('');
    const [saveAttribute] = useSaveAttributeMutation();
    const {dispatch: editRecordDispatch} = useEditRecordReducer();

    const allowFreeEntry = attribute.values_list.allowFreeEntry;
    const allowListUpdate = attribute.values_list.allowListUpdate;

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
    if (attribute.multiple_values) {
        const currentValues = form.getFieldValue(attribute.id);
        options = options.filter(option => !currentValues.includes(option.value));
    }

    if (allowFreeEntry) {
        if (!attribute.multiple_values) {
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
        setHasChanged(false);
        if (inheritedFlags.isInheritedValue) {
            setTimeout(() => onChange(inheritedFlags.inheritedValue.raw_value, options), 0);
        } else if (calculatedFlags.isCalculatedValue) {
            setTimeout(() => onChange(calculatedFlags.calculatedValue.raw_value, options), 0);
        }
        await handleSubmit(null, attribute.id);
    };

    const _handleOnChange = async (selectedValue: string) => {
        setHasChanged(true);
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
        onChange(selectedValue, options);
    };

    const _handleOnClear = async () => {
        await _handleOnChange('');
    };

    const _handleOnSearch = async (search: string) => {
        setSearchedString(search);
        if (search) {
            setIsFocused(true);
        }
    };

    const _handleDropdownVisibleChange = (visible: boolean) => {
        setIsFocused(visible);

        if (!hasChanged && isNewValueOfMultivalues) {
            removeLastValueOfMultivalues();
        }
    };

    const _handleOnFocus = () => {
        setActiveValue();
    };

    const valueToDisplay = isFocused ? value : presentationValue;
    const isValueEmpty = value === '';

    return (
        <KitSelect
            id={attribute.id}
            data-testid={attribute.id}
            autoFocus={isFocused}
            open={isFocused}
            value={isValueEmpty ? undefined : valueToDisplay}
            allowClear={!required && value}
            disabled={readonly}
            options={options}
            status={errors.length > 0 && 'error'}
            showSearch
            onDropdownVisibleChange={_handleDropdownVisibleChange}
            onSelect={_handleOnChange}
            onChange={onChange}
            onClear={_handleOnClear}
            onSearch={_handleOnSearch}
            onFocus={_handleOnFocus}
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
