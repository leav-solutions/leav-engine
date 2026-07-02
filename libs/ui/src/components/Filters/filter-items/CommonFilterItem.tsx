import {type FunctionComponent} from 'react';
import {FilterDropDown} from '../filter-items/filter-type/FilterDropDown';
import styled from 'styled-components';
import {KitFilter} from 'aristid-ds';
import {AttributeFormat, type RecordFilterCondition} from '_ui/_gqlTypes';
import {getAttributeConditionOptions} from '../filter-items/filter-type/useConditionOptionsByType';
import {type TFunction} from 'i18next';
import {nullValueConditions} from '../conditionsHelper';
import {
    isUIFilterStandard,
    isUIFilterTree,
    isUIFilterWithSmartFilter,
    type IUIFilterStandard,
    type UIFilter,
} from '../_types';
import {ACTIVE_ATTRIBUTE_ID} from '_ui/constants';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {AttributeConditionFilter} from '_ui/types';
import dayjs from 'dayjs';

const FilterStyled = styled(KitFilter)`
    flex: 0 0 auto;
`;

const getFilterValues = (filter: UIFilter, t: TFunction): string[] => {
    if (filter.condition && nullValueConditions.includes(filter.condition as RecordFilterCondition)) {
        if (filter.attribute.format === AttributeFormat.date) {
            if (filter.condition === AttributeConditionFilter.TODAY) {
                return [dayjs().format('YYYY-MM-DD')];
            } else if (filter.condition === AttributeConditionFilter.IS_EMPTY) {
                return [t('explorer.date_presets.undefined')];
            }
        }
        const conditionOption = getAttributeConditionOptions(t).find(option => option.value === filter.condition);
        return [conditionOption?.label ?? ''];
    }

    const filterValues: string[] = filter.withEmptyValues ? [t('filters.empty-value')] : [];

    if (isUIFilterTree(filter)) {
        return [...filterValues, ...(filter.userFormattedValue ?? [])];
    }

    if (isUIFilterWithSmartFilter(filter)) {
        return [...filterValues, ...(filter.formattedValue ?? [])];
    }

    if (
        isUIFilterStandard(filter) &&
        [AttributeFormat.date, AttributeFormat.boolean].includes(filter.attribute.format)
    ) {
        if (!filter.formattedValue) {
            return filterValues;
        }
        if (filter.condition === AttributeConditionFilter.LESS_THAN) {
            return [`< ${filter.formattedValue ? filter.formattedValue : filterValues}`];
        } else if (filter.condition === AttributeConditionFilter.GREATER_THAN) {
            return [`> ${filter.formattedValue ? filter.formattedValue : filterValues}`];
        }
        return [...filterValues, filter.formattedValue];
    }

    const valuesList = filter.attribute.valuesList;
    if (!valuesList || !('linkedValues' in valuesList) || !filter.value) {
        return filterValues;
    }

    const valuesFilter = Array.isArray(filter.value) ? filter.value : [filter.value];
    const labels = (valuesList.linkedValues ?? [])
        .filter(val => valuesFilter.includes(val?.id))
        .map(val => val?.whoAmI?.label ?? '');
    return [...filterValues, ...labels];
};

export interface ICommonFilterProps {
    filter: UIFilter;
    isPinned?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    className?: string;
}

const isActiveAttribute = (filter: UIFilter): filter is IUIFilterStandard =>
    filter.attribute.format === AttributeFormat.boolean &&
    filter.attribute.id === ACTIVE_ATTRIBUTE_ID &&
    isUIFilterStandard(filter);

export const CommonFilterItem: FunctionComponent<ICommonFilterProps> = ({
    filter,
    isPinned = false,
    readonly = false,
    disabled,
    className,
}) => {
    const {t} = useSharedTranslation();

    let canReset = true;
    let effectiveFilter = filter;

    // Active attribute is a special case, we need to handle it differently
    if (isActiveAttribute(filter)) {
        canReset = false;

        if (!filter.value) {
            effectiveFilter = {...filter, value: 'true', formattedValue: t('explorer.true')};
        }
    }

    return (
        <FilterStyled
            className={className}
            disabled={disabled}
            readonly={readonly}
            expandable={!readonly}
            label={effectiveFilter.attribute.label}
            values={getFilterValues(effectiveFilter, t)}
            dropDownProps={{
                placement: 'bottomLeft',
                dropdownRender: () => (
                    <FilterDropDown filter={effectiveFilter} canReset={canReset} canRemove={!isPinned} />
                ),
            }}
            showSingleValue
        />
    );
};
