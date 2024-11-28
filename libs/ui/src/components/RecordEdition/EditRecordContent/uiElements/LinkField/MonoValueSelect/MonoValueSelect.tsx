// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useState} from 'react';
import {AntForm, KitSelect, KitTypography} from 'aristid-ds';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import useSharedTranslation from '_ui/hooks/useSharedTranslation/useSharedTranslation';
import {RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {SelectProps} from 'antd';
import {DefaultOptionType} from 'antd/es/select';
import {useGetOptionsQuery} from './useGetOptionsQuery';
import {IRecordIdentity} from '_ui/types';
import {IRecordPropertyLink} from '_ui/_queries/records/getRecordPropertiesQuery';
import {useDebouncedValue} from '_ui/hooks/useDebouncedValue/useDebouncedValue';
import styled from 'styled-components';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {useValueDetailsButton} from '_ui/components/RecordEdition/EditRecordContent/shared/ValueDetailsBtn/useValueDetailsButton';

const ResultsCount = styled(KitTypography.Text)`
    margin-bottom: calc(var(--general-spacing-s) * 1px);
`;

interface IMonoValueSelectProps extends IProvidedByAntFormItem<SelectProps<string[]>, SelectProps<string>> {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    attribute: RecordFormAttributeLinkAttributeFragment;
    label: string;
    onSelectClear: (value: IRecordPropertyLink) => void;
    onSelectChange: (
        values: Array<{
            value: IRecordIdentity;
            idValue: string;
        }>
    ) => void;
    required?: boolean;
    shouldShowValueDetailsButton?: boolean;
}

export const MonoValueSelect: FunctionComponent<IMonoValueSelectProps> = ({
    value,
    onChange,
    activeValue,
    attribute,
    label,
    onSelectChange,
    onSelectClear,
    required = false,
    shouldShowValueDetailsButton = false
}) => {
    if (!onChange) {
        throw Error('MonoValueSelect should be used inside a antd Form.Item');
    }

    const {t} = useSharedTranslation();
    const {errors} = AntForm.Item.useStatus();
    const form = AntForm.useFormInstance();

    const [searchInput, setSearchInput] = useState('');
    const debouncedSearchInput = useDebouncedValue(searchInput, 300);

    const {
        loading,
        selectOptions,
        updateLeavField,
        runFullTextSearch,
        searchResultCount,
        suggestionsCount,
        optionsType
    } = useGetOptionsQuery({
        activeValue,
        linkedLibraryId: attribute.linked_library.id,
        onSelectChange
    });

    const {onValueDetailsButtonClick} = useValueDetailsButton({
        value: null,
        attribute
    });

    const handleSelect = async (optionValue: string, ...antOnChangeParams: DefaultOptionType[]) => {
        onChange(optionValue, antOnChangeParams);
        await form.validateFields([attribute.id]);

        updateLeavField(optionValue);
    };

    const handleClear = async () => {
        form.setFieldValue(attribute.id, undefined);
        onSelectClear(activeValue);
    };

    const handleSearch = async (val: string) => setSearchInput(val);

    useEffect(() => {
        runFullTextSearch(debouncedSearchInput);
    }, [debouncedSearchInput]);

    return (
        <KitSelect
            loading={loading}
            value={value}
            required={required}
            label={label}
            options={selectOptions}
            status={errors.length > 0 && 'error'}
            showSearch
            optionFilterProp="label"
            placeholder={t('record_edition.placeholder.record_select')}
            onSelect={handleSelect}
            onChange={onChange}
            onClear={required ? undefined : handleClear}
            allowClear={!required}
            onInfoClick={shouldShowValueDetailsButton ? onValueDetailsButtonClick : null}
            onSearch={handleSearch}
            filterOption={false} // To avoid dynamic filtering when debouncing
            dropdownRender={menu => {
                if (loading) {
                    return menu;
                }

                return (
                    <>
                        <ResultsCount weight="bold">
                            {optionsType === 'search'
                                ? t('record_edition.link_search_result_count', {
                                      count:
                                          searchResultCount > suggestionsCount ? suggestionsCount : searchResultCount,
                                      total: searchResultCount
                                  })
                                : t('record_edition.suggestions_count', {count: suggestionsCount})}
                        </ResultsCount>
                        {menu}
                    </>
                );
            }}
        />
    );
};
