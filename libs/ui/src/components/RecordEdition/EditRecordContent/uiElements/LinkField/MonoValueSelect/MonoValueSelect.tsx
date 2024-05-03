// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, ReactNode, useEffect, useState} from 'react';
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

const ResultsCount = styled(KitTypography.Text)`
    margin-bottom: calc(var(--general-spacing-s) * 1px);
`;

interface IMonoValueSelectProps extends IProvidedByAntFormItem<SelectProps<string[]>, SelectProps<string>> {
    activeValue: RecordFormElementsValueLinkValue | undefined;
    attribute: RecordFormAttributeLinkAttributeFragment;
    label: string;
    onSelectClear: (value: IRecordPropertyLink) => void;
    onSelectChange: (values: IRecordIdentity[]) => void;
    required: boolean;
    infoButton?: ReactNode;
}

export const MonoValueSelect: FunctionComponent<IMonoValueSelectProps> = ({
    activeValue,
    value,
    onChange,
    attribute,
    label,
    onSelectChange,
    onSelectClear,
    required,
    infoButton
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
        totalCount,
        searchResultCount,
        suggestionsCount,
        optionsType
    } = useGetOptionsQuery({
        activeValue,
        linkedLibraryId: attribute.linked_library.id,
        onSelectChange
    });

    const handleSelect = async (optionValue: string, ...antOnChangeParams: DefaultOptionType[]) => {
        onChange(optionValue, antOnChangeParams);
        await form.validateFields([attribute.id]);

        updateLeavField(optionValue);
    };

    const handleClear = async () => {
        form.setFieldValue(attribute.id, undefined);
        try {
            await form.validateFields([attribute.id]);
        } catch (error) {
            // Do nothing
        }
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
            placeholder={t('record_edition.record_select')}
            onSelect={handleSelect}
            onChange={onChange}
            onClear={required ? undefined : handleClear}
            allowClear={!required}
            infoIcon={infoButton}
            onInfoClick={Boolean(infoButton) ? () => void 0 : undefined}
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
                                      count: searchResultCount,
                                      total: totalCount
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
