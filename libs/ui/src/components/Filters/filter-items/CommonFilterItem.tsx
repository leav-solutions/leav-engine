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
    isUIFilterThrough,
    isUIFilterTree,
    isUIFilterValueList,
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

const conditionSymbols: Partial<Record<RecordFilterCondition, string>> = {
    [AttributeConditionFilter.EQUAL]: '=',
    [AttributeConditionFilter.NOT_EQUAL]: '≠',
    [AttributeConditionFilter.GREATER_THAN]: '>',
    [AttributeConditionFilter.LESS_THAN]: '<',
};

/**
 * Builds the operator prefix (glued to the value) shown on the filter chip, e.g. `= `, `≠ `, `> `,
 * or a translated label (`Contient `) for text conditions without a natural symbol.
 * Returns `''` when there is no meaningful operator (null condition, e.g. boolean).
 */
const getConditionPrefix = (filter: UIFilter, t: TFunction): string => {
    const condition = isUIFilterThrough(filter) ? filter.subCondition : filter.condition;
    if (!condition) {
        return '';
    }

    const symbol = conditionSymbols[condition as RecordFilterCondition];
    if (symbol) {
        return `${symbol} `;
    }

    const conditionOption = getAttributeConditionOptions(t).find(option => option.value === condition);
    return conditionOption?.label ? `${conditionOption.label} ` : '';
};

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

    // A "through" filter is rendered as a counting badge (see showSingleValue below): only feed its
    // value into `values` so the badge (and its tooltip) has something to display.
    if (isUIFilterThrough(filter)) {
        return filter.value ? [...filterValues, String(filter.value)] : filterValues;
    }

    if (
        isUIFilterStandard(filter) &&
        [AttributeFormat.date, AttributeFormat.boolean].includes(filter.attribute.format)
    ) {
        if (!filter.formattedValue) {
            return filterValues;
        }
        // Boolean selection is stored with an EQUAL condition (BooleanAttributeDropDown), but its
        // operator is not user-chosen, so it must stay unprefixed ("Oui"/"Non"). Only dates are prefixed.
        const prefix = filter.attribute.format === AttributeFormat.date ? getConditionPrefix(filter, t) : '';
        return [...filterValues, `${prefix}${filter.formattedValue}`];
    }

    const valuesList = filter.attribute.valuesList;

    // Values-list filters have a fixed condition (EQUAL) → no operator prefix. Link value lists map
    // their selected ids to labels; standard value lists keep their previous (label-less) behavior.
    if (isUIFilterValueList(filter)) {
        if (!valuesList || !('linkedValues' in valuesList) || !filter.value) {
            return filterValues;
        }
        const valuesFilter = Array.isArray(filter.value) ? filter.value : [filter.value];
        const labels = (valuesList.linkedValues ?? [])
            .filter(val => valuesFilter.includes(val?.id))
            .map(val => val?.whoAmI?.label ?? '');
        return [...filterValues, ...labels];
    }

    // numeric / text / rich_text / raw link / through: render the raw value, prefixed with its operator.
    if (!filter.value) {
        return filterValues;
    }
    const rawValues = (Array.isArray(filter.value) ? filter.value : [filter.value]) as string[];
    const prefix = getConditionPrefix(filter, t);
    // Prefix only the single-value display (a multi-value filter is rendered as a counting badge).
    return [
        ...filterValues,
        ...rawValues.map((value, index) =>
            rawValues.length === 1 && index === 0 ? `${prefix}${value}` : String(value),
        ),
    ];
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
                popupRender: () => (
                    <FilterDropDown filter={effectiveFilter} canReset={canReset} canRemove={!isPinned} />
                ),
            }}
            showSingleValue={!isUIFilterThrough(effectiveFilter)}
        />
    );
};
