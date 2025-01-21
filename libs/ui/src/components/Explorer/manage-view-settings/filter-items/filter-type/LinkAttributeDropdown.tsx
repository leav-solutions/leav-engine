// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useEffect, useState} from 'react';
import {KitInput, KitSelect} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IFilterChildrenLinkDropDownProps} from '_ui/components/Explorer/_types';
import {useConditionsOptionsByType} from './useConditionOptionsByType';
import {AttributeConditionFilter, ThroughConditionFilter} from '_ui/types';
import styled from 'styled-components';
import {useGetLibraryAttributesLazyQuery} from '_ui/_gqlTypes';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {FilterDropdownContent} from './FilterDropdownContent';

const InputStyled = styled(KitInput)`
    width: 100%;
`;

export const LinkAttributeDropDown: FunctionComponent<IFilterChildrenLinkDropDownProps> = ({
    filter,
    onFilterChange
}) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const {conditionOptionsByType} = useConditionsOptionsByType(filter);

    const [fetchLibraryAttributes, {loading: libraryAttributesLoading, data: libraryAttributesData}] =
        useGetLibraryAttributesLazyQuery();

    const [selectedLinkAttribute, setSelectedLinkAttribute] = useState<string | null>(null);

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition =>
        onFilterChange({...filter, condition});

    const _onLinkAttributeChange: ComponentProps<typeof KitSelect>['onChange'] = attributeId =>
        setSelectedLinkAttribute(attributeId);

    const _onInputChanged: ComponentProps<typeof KitInput>['onChange'] = event => {
        const shouldIgnoreInputChange =
            event.target.value.length < 3 && (filter.value?.length ?? 0) <= event.target.value.length;
        if (shouldIgnoreInputChange) {
            return;
        }
        onFilterChange({...filter, value: event.target.value.length === 0 ? null : event.target.value});
    };

    useEffect(() => {
        if (filter.condition === ThroughConditionFilter.THROUGH && filter.attribute?.linkedLibrary?.id) {
            fetchLibraryAttributes({
                variables: {id: filter.attribute.linkedLibrary.id}
            });
        }
    }, [filter.condition]);

    const showSearch =
        filter.condition &&
        ![
            AttributeConditionFilter.IS_EMPTY,
            AttributeConditionFilter.IS_NOT_EMPTY,
            ThroughConditionFilter.THROUGH
        ].includes(filter.condition);

    const libraryLinkAttributes = libraryAttributesData?.libraries?.list[0].attributes ?? [];
    const linkAttributesOptions = libraryLinkAttributes.map(attribute => ({
        label: localizedTranslation(attribute.label, lang) ?? '',
        value: attribute.id
    }));

    const _handleThroughFilterChange = filterData => {
        console.log({filterData});
    };

    const linkAttributeProps = libraryLinkAttributes.find(attribute => attribute.id === selectedLinkAttribute);

    return (
        <>
            <KitSelect options={conditionOptionsByType} onChange={_onConditionChanged} value={filter.condition} />
            {showSearch && (
                <InputStyled
                    placeholder={String(t('explorer.type-a-value'))}
                    value={filter.value ?? undefined}
                    onChange={_onInputChanged}
                />
            )}
            {filter.condition === AttributeConditionFilter.THROUGH && (
                <>
                    <KitSelect
                        options={linkAttributesOptions}
                        onChange={_onLinkAttributeChange}
                        value={selectedLinkAttribute}
                        loading={libraryAttributesLoading}
                    />
                    {selectedLinkAttribute && linkAttributeProps && (
                        <FilterDropdownContent
                            filter={{
                                id: filter.id + '_through_condition',
                                field: selectedLinkAttribute ?? '',
                                attribute: {
                                    ...linkAttributeProps,
                                    label: localizedTranslation(linkAttributeProps.label, lang) ?? ''
                                },
                                condition: AttributeConditionFilter.CONTAINS,
                                value: null
                            }}
                            onFilterChange={_handleThroughFilterChange}
                        />
                    )}
                </>
            )}
        </>
    );
};
