// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useDebouncedValue} from '_ui/hooks/useDebouncedValue';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitInput, KitTypography} from 'aristid-ds';
import {ChangeEvent, FunctionComponent, useMemo, useState} from 'react';
import {FaCheck, FaSearch} from 'react-icons/fa';
import styled from 'styled-components';

// Example file for value list
interface IFilterValueListProps {
    values: string[];
    selectedValues: string[];
    multiple: boolean;
    freeEntry: boolean;
    onSelectionChanged: (value: string[]) => void;
}

const FilterValueListStyledUl = styled.ul`
    padding: 0;
    margin: 0;
    list-style: none;
`;

const ValueListItemValueLi = styled.li`
    display: flex;
    align-items: center;
    min-height: 32px;
    height: 32px;
    border-radius: calc(var(--general-border-radius-s) * 1px);
    cursor: pointer;

    &.selected,
    &:hover {
        color: var(--components-Icon-colors-icon-on, var(--general-utilities-main-default));
        background-color: var(--components-Icon-colors-background-on, var(--general-utilities-main-light));
    }

    .label {
        flex: 1;
        padding: 0 calc(var(--general-spacing-xs) * 1px);
    }

    .check {
        flex: 0;
        padding: 0 calc(var(--general-spacing-xs) * 1px);
    }
`;

export const FilterValueList: FunctionComponent<IFilterValueListProps> = ({
    values,
    selectedValues,
    multiple,
    onSelectionChanged
}) => {
    const {t} = useSharedTranslation();
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearchInput = useDebouncedValue(searchInput, 300);

    const searchFilteredValues = useMemo(() => {
        if (debouncedSearchInput === '' || debouncedSearchInput.length < 3) {
            return values;
        }

        return values.filter(value => value.includes(debouncedSearchInput));
    }, [debouncedSearchInput, values]);

    const onSearchChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const shouldIgnoreInputChange = event.target.value.length < 3 && debouncedSearchInput.length < 3;
        if (shouldIgnoreInputChange) {
            return;
        }
        setSearchInput(() => {
            if (event.target.value.length > 2) {
                return event.target.value;
            }
            return '';
        });
    };

    const onClickItem = (value: string) => {
        if (selectedValues.includes(value)) {
            onSelectionChanged(selectedValues.filter(selectedValue => selectedValue !== value));
        } else {
            onSelectionChanged(multiple ? [...selectedValues, value] : [value]);
        }
    };

    return (
        <>
            <KitInput
                placeholder={String(t('global.search'))}
                onChange={onSearchChanged}
                allowClear
                prefix={<FaSearch />}
            />
            <FilterValueListStyledUl>
                {searchFilteredValues.map(value => {
                    const isSelected = selectedValues.includes(value);
                    return (
                        <ValueListItemValueLi
                            key={value}
                            className={isSelected ? 'selected' : ''}
                            onClick={() => onClickItem(value)}
                        >
                            <KitTypography.Text className="label" ellipsis size="fontSize5">
                                {value}
                            </KitTypography.Text>
                            {isSelected && (
                                <KitTypography.Text className="check" size="fontSize5">
                                    <FaCheck />
                                </KitTypography.Text>
                            )}
                        </ValueListItemValueLi>
                    );
                })}
            </FilterValueListStyledUl>
        </>
    );
};
