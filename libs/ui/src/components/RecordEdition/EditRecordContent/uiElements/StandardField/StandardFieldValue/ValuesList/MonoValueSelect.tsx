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
    state,
    attribute,
    handleSubmit
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
                (allowListUpdate ? t('record_edition.create_and_select_option') : t('record_edition.select_option')) +
                searchedString
        });
    }

    const searchResultsCount = useMemo(
        () => options.filter(option => option.label.toLowerCase().includes(searchedString.toLowerCase())).length,
        [searchedString]
    );

    const _resetToInheritedOrCalculatedValue = async () => {
        if (state.isInheritedValue) {
            setTimeout(() => onChange(state.inheritedValue.raw_value, options), 0);
        } else if (state.isCalculatedValue) {
            setTimeout(() => onChange(state.calculatedValue.raw_value, options), 0);
        }
        await handleSubmit('', attribute.id);
    };

    const _handleOnChange = async (selectedValue: string) => {
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

    const required = state.formElement.settings.required;

    const valueToDisplay = isFocused ? value : presentationValue;

    return (
        <KitSelect
            data-testid={attribute.id}
            value={valueToDisplay}
            allowClear={!required && value}
            options={options}
            open={isFocused}
            status={errors.length > 0 && 'error'}
            showSearch
            onDropdownVisibleChange={visible => setIsFocused(visible)}
            onSelect={_handleOnChange}
            onChange={onChange}
            onClear={_handleOnClear}
            onSearch={_handleOnSearch}
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
