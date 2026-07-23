import {type ComponentProps, type FunctionComponent, useEffect, useState} from 'react';
import {KitInput, type KitSelect} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useConditionsOptionsByType} from './useConditionOptionsByType';
import {AttributeConditionFilter, ThroughConditionFilter} from '_ui/types';
import styled from 'styled-components';
import {useGetLibraryAttributesLazyQuery} from '_ui/_gqlTypes';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {FilterDropdownContent} from './FilterDropdownContent';
import {type IFilterChildrenLinkDropDownProps} from './_types';
import {isUIFilterThrough, type IUIFilterThrough, type UIFilter} from '../../_types';
import {FilterSelect} from './FilterSelect';

const InputStyled = styled(KitInput)`
    width: 100%;
`;

export const LinkAttributeDropDown: FunctionComponent<IFilterChildrenLinkDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef,
    removeThroughCondition = false,
}) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);
    const availableConditionsOptions = removeThroughCondition
        ? conditionOptionsByType.filter(({value}) => value !== ThroughConditionFilter.THROUGH)
        : conditionOptionsByType;

    const [getLibraryAttributes, {loading: libraryAttributesLoading, data: libraryAttributesData}] =
        useGetLibraryAttributesLazyQuery();

    const [selectedSubField, setSelectedSubField] = useState<string | null>(
        isUIFilterThrough(filter) ? filter.subField : null,
    );

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        onFilterChange({...filter, condition});
    };

    const _onSubFieldAttributeChange: ComponentProps<typeof KitSelect>['onChange'] = attributeId => {
        setSelectedSubField(attributeId ?? null);
        if (!attributeId) {
            // Clearing the sub-attribute resets the through configuration (sub-field / condition / value).
            onFilterChange({...filter, subField: null, subCondition: null, value: null} as IUIFilterThrough);
        }
    };

    const _onInputChanged: ComponentProps<typeof KitInput>['onChange'] = event => {
        const shouldIgnoreInputChange =
            event.target.value.length < 3 && (filter.value?.length ?? 0) <= event.target.value.length;
        if (shouldIgnoreInputChange) {
            return;
        }
        onFilterChange({...filter, value: event.target.value.length === 0 ? null : event.target.value});
    };

    useEffect(() => {
        if (filter.condition === ThroughConditionFilter.THROUGH && filter.attribute.linkedLibrary?.id) {
            getLibraryAttributes({
                variables: {libraryId: filter.attribute.linkedLibrary.id},
            });
        }
    }, [filter.condition, filter.attribute, getLibraryAttributes]);

    const showSearch =
        filter.condition &&
        ![
            AttributeConditionFilter.IS_EMPTY,
            AttributeConditionFilter.IS_NOT_EMPTY,
            ThroughConditionFilter.THROUGH,
        ].includes(filter.condition);

    const libraryLinkAttributes = libraryAttributesData?.libraries?.list[0].attributes ?? [];
    const linkAttributesOptions = libraryLinkAttributes.map(attribute => ({
        label: localizedTranslation(attribute.label, lang) ?? '',
        value: attribute.id,
    }));

    const _handleThroughFilterChange = (filterData: UIFilter) => {
        onFilterChange({
            ...filter,
            subField: filterData.field,
            subCondition: filterData.condition,
            value: filterData.value,
        } as IUIFilterThrough);
    };

    const linkedAttribute = libraryLinkAttributes.find(attribute => attribute.id === selectedSubField);

    return (
        <>
            <FilterSelect
                options={availableConditionsOptions}
                onChange={_onConditionChanged}
                value={filter.condition}
                // Top-level link condition is never cleared; a nested "through" sub-condition stays clearable.
                allowClear={removeThroughCondition}
                getPopupContainer={() => selectDropDownRef?.current ?? document.body}
                aria-label={String(t('explorer.filter-link-condition'))}
            />
            {showSearch && (
                <InputStyled
                    placeholder={String(t('explorer.type-a-value'))}
                    value={filter.value ?? undefined}
                    onChange={_onInputChanged}
                />
            )}
            {filter.condition === AttributeConditionFilter.THROUGH && (
                <>
                    <FilterSelect
                        options={linkAttributesOptions}
                        onChange={_onSubFieldAttributeChange}
                        value={libraryAttributesLoading ? null : selectedSubField}
                        placeholder={libraryAttributesLoading ? t('global.loading') : null}
                        loading={libraryAttributesLoading}
                        // The sub-attribute is a step in the through configuration, so it can be cleared.
                        allowClear
                        getPopupContainer={() => selectDropDownRef?.current ?? document.body}
                        aria-label={String(t('explorer.filter-link-attribute'))}
                    />
                    {selectedSubField && linkedAttribute && (
                        <FilterDropdownContent
                            removeThroughCondition={true}
                            filter={{
                                id: filter.id,
                                field: selectedSubField,
                                attribute: {
                                    ...linkedAttribute,
                                    label: localizedTranslation(linkedAttribute.label, lang) ?? '',
                                },
                                condition: filter.subCondition,
                                value: filter.value,
                            }}
                            onFilterChange={_handleThroughFilterChange}
                            selectDropDownRef={selectDropDownRef}
                        />
                    )}
                </>
            )}
        </>
    );
};
