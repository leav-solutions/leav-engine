// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type FunctionComponent, type KeyboardEvent, useMemo, useState} from 'react';
import {KitInput} from 'aristid-ds';
import styled from 'styled-components';
import {RecordFilterCondition} from '_ui/_gqlTypes';
import {
    isUIFilterLinkWithValueList,
    isUIFilterStandardWithValueList,
    type IUIFilterValueList,
    type UIFilter,
} from '../../_types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faSearch} from '@fortawesome/free-solid-svg-icons';
import {EmptyValueCheckbox} from '../EmptyValueCheckbox';

interface IFilterValueListDropDownProps {
    filter: IUIFilterValueList;
    onFilterChange: (filter: UIFilter) => void;
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

const RightIcon = styled(FontAwesomeIcon)<{$visible: boolean}>`
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

export const FilterValueListDropDown: FunctionComponent<IFilterValueListDropDownProps> = ({filter, onFilterChange}) => {
    const {t} = useSharedTranslation();
    const [searchText, setSearchText] = useState('');

    const getOptionLabelText = (label: any): string => (typeof label === 'string' ? label : '');

    // Generate an option list for the filter dropdown to select a value
    const _createOptionListFromValueList = () => {
        let valueListFormatted: Array<{label: string; value: string}> = [];
        if (isUIFilterStandardWithValueList(filter)) {
            valueListFormatted =
                filter.attribute.valuesList?.values?.map(value => ({
                    label: value,
                    value,
                })) || [];
        } else if (isUIFilterLinkWithValueList(filter)) {
            valueListFormatted =
                filter.attribute.valuesList?.linkedValues?.map(value => ({
                    label: value.whoAmI.label!,
                    value: value.id,
                })) || [];
        }

        return [...valueListFormatted];
    };

    const _handleOnCheckEmptyValue = (selected: boolean) => {
        onFilterChange({
            ...filter,
            withEmptyValues: selected,
        });
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
                field: (filter as any).field,
            });
            return;
        }

        onFilterChange({
            ...filter,
            condition: RecordFilterCondition.EQUAL,
            value: valuesSelected,
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
            <KitInput
                prefix={<FontAwesomeIcon icon={faSearch} />}
                placeholder={t('global.search')}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
            />
            <EmptyValueCheckbox onSelect={_handleOnCheckEmptyValue} filter={filter} />
            {filter.condition === RecordFilterCondition.EQUAL && (
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
                                <RightIcon $visible={selected} icon={faCheck} />
                            </OptionRow>
                        );
                    })}
                </ListDivStyled>
            )}
        </>
    );
};
