// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FaCheck} from 'react-icons/fa';
import {ComponentProps, FunctionComponent, KeyboardEvent, useMemo, useState} from 'react';
import {KitInput, KitSelect} from 'aristid-ds';
import styled from 'styled-components';
import {
    ExplorerFilter,
    IExplorerFilterValueList,
    isExplorerFilterLinkWithValueList,
    isExplorerFilterStandardWithValueList
} from '_ui/components/Explorer/_types';
import {RecordFilterCondition} from '_ui/_gqlTypes';

interface IFilterValueListDropDownProps {
    filter: IExplorerFilterValueList;
    onFilterChange: (filter: ExplorerFilter) => void;
    selectDropDownRef?: React.RefObject<HTMLDivElement>;
}

const ListDivStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-xxs) * 1px);
`;

const OptionRow = styled.div<{$selected: boolean}>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 calc(var(--general-spacing-xs) * 1px);
    height: 36px;
    border-radius: calc(var(--general-spacing-xs) * 1px);
    cursor: pointer;
    background: ${props => (props.$selected ? 'var(--general-utilities-main-light)' : 'transparent')};
    color: var(--general-utilities-text-primary);

    &:hover {
        background: var(--general-utilities-main-light);
    }
`;

const RightIcon = styled(FaCheck)<{$visible: boolean}>`
    color: var(--general-utilities-main-default);
    opacity: ${props => (props.$visible ? 1 : 0)};
    transition: opacity 0.12s ease-in-out;
`;

const Label = styled.div`
    flex: 1;
    min-width: 0; /* allow flex child to shrink for ellipsis */
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

export const FilterValueListDropDown: FunctionComponent<IFilterValueListDropDownProps> = ({
    filter,
    onFilterChange,
    selectDropDownRef
}) => {
    const {t} = useSharedTranslation();
    const [searchText, setSearchText] = useState('');

    const getOptionLabelText = (label: any): string => (typeof label === 'string' ? label : '');

    const availableConditionsOptions = [
        {label: t('filters.equal'), value: RecordFilterCondition.EQUAL},
        // disable NOT_EQUAL for now because of backend condition filter issue
        // {label: t('filters.not-equal'), value: RecordFilterCondition.NOT_EQUAL}
        {label: t('filters.is-empty'), value: RecordFilterCondition.IS_EMPTY},
        {label: t('filters.is-not-empty'), value: RecordFilterCondition.IS_NOT_EMPTY}
    ];

    const _onConditionChanged: ComponentProps<typeof KitSelect>['onChange'] = condition => {
        onFilterChange({...filter, condition});
    };

    // Generate an option list for the filter dropdown to select a value
    const _createOptionListFromValueList = () => {
        let valueListFormatted: Array<{label: string; value: string}> = [];
        if (isExplorerFilterStandardWithValueList(filter)) {
            valueListFormatted =
                filter.attribute.valuesList?.values?.map(value => ({
                    label: value,
                    value
                })) || [];
        } else if (isExplorerFilterLinkWithValueList(filter)) {
            valueListFormatted =
                filter.attribute.valuesList?.linkedValues?.map(value => ({
                    label: value.whoAmI.label!,
                    value: value.id
                })) || [];
        }

        return [...valueListFormatted];
    };

    const _handleToggle = (toggledValue: string) => {
        // remove or add the toggledValue from the filter.value
        const currentList = filter.value || [];
        const current = new Set(currentList);
        if (current.has(toggledValue)) {
            current.delete(toggledValue);
        } else {
            current.add(toggledValue);
        }
        const valuesSelected = Array.from(current);

        if (valuesSelected.length === 0) {
            // Clear filter when nothing selected
            onFilterChange({
                ...filter,
                value: [],
                field: (filter as any).field
            });
            return;
        }

        // Keep EQUAL/NOT_EQUAL condition per item; default to EQUAL if none chosen yet
        const condition: RecordFilterCondition =
            filter.condition === RecordFilterCondition.NOT_EQUAL
                ? RecordFilterCondition.NOT_EQUAL
                : RecordFilterCondition.EQUAL;

        onFilterChange({
            ...filter,
            condition,
            value: valuesSelected
        });
    };

    const options = _createOptionListFromValueList();

    const isChecked = (optionValue: string) => {
        const set = new Set(filter.value ?? []);
        return set.has(optionValue);
    };

    const filteredOptions = useMemo(() => {
        if (!searchText) {
            return options;
        }
        const st = searchText.toLowerCase();
        const specials = new Set(['']);
        return options.filter(o => specials.has(o.value) || getOptionLabelText(o.label).toLowerCase().includes(st));
    }, [options, searchText]);

    const onKeyToggle = (e: KeyboardEvent<HTMLDivElement>, value: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            _handleToggle(value);
        }
    };

    return (
        <>
            <KitSelect
                options={availableConditionsOptions}
                onChange={_onConditionChanged}
                allowClear={false}
                value={filter.condition ?? RecordFilterCondition.EQUAL}
                aria-label={String(t('explorer.filter-condition'))}
                getPopupContainer={() => selectDropDownRef?.current ?? document.body}
            />
            {filter.condition === RecordFilterCondition.EQUAL && (
                <>
                    <KitInput
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        placeholder={t('global.search') + '...'}
                        allowClear
                    />
                    <ListDivStyled role="group" aria-label={String(t('explorer.filter-value'))}>
                        {filteredOptions.map(opt => {
                            const selected = isChecked(opt.value);
                            return (
                                <OptionRow
                                    key={opt.value}
                                    $selected={selected}
                                    role="button"
                                    aria-pressed={selected}
                                    tabIndex={0}
                                    onClick={() => _handleToggle(opt.value)}
                                    onKeyDown={e => onKeyToggle(e, opt.value)}
                                >
                                    <Label>{opt.label}</Label>
                                    <RightIcon $visible={selected} />
                                </OptionRow>
                            );
                        })}
                    </ListDivStyled>
                </>
            )}
        </>
    );
};
