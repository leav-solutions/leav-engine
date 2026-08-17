import {useState} from 'react';
import {KitFilter, KitLoader} from 'aristid-ds';
import {FilterDropdownContainer} from './FilterDropdownContainer';
import {FilterDropdownFooter} from './FilterDropdownFooter';
import {FilterDropdownSearch} from './FilterDropdownSearch';
import {type FilterOption} from './types';

type MultiSelectFilterProps<TValue extends string> = {
    label: string;
    options: Array<FilterOption<TValue>>;
    value: TValue[];
    onChange: (value: TValue[]) => void;
    onReset: () => void;
    disabled?: boolean;
    searchable?: boolean;
    loading?: boolean;
    onOpen?: () => void;
};

export const MultiSelectFilter = <TValue extends string>({
    label,
    options,
    value,
    onChange,
    onReset,
    disabled,
    searchable = false,
    loading = false,
    onOpen,
}: MultiSelectFilterProps<TValue>) => {
    const [search, setSearch] = useState('');
    const [resetKey, setResetKey] = useState(0);

    const items = options.map(option => ({
        key: option.value,
        label: option.label,
    }));

    const filteredItems = search
        ? items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
        : items;

    const _clearSearch = () => {
        setSearch('');
        setResetKey(k => k + 1);
    };

    // Called on every opening: the caller's fetch hook owns the "already loaded" guard.
    const _handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            onOpen?.();
        } else {
            _clearSearch();
        }
    };

    const _handleMenuClick = ({key}: {key: string}) => {
        const clicked = key as TValue;
        onChange(value.includes(clicked) ? value.filter(v => v !== clicked) : [...value, clicked]);
    };

    const _handleReset = () => {
        _clearSearch();
        onReset();
    };

    const selectedLabels = options.filter(option => value.includes(option.value)).map(option => option.label);

    return (
        // See SingleSelectFilter: `key={resetKey}` forces a remount on close so the chip's
        // `active`/`values` catch up with a reset/onChange applied from inside the popup.
        <KitFilter
            key={resetKey}
            label={label}
            active={value.length > 0}
            expandable
            showSingleValue
            disabled={disabled}
            values={selectedLabels}
            dropDownProps={{
                onOpenChange: _handleOpenChange,
                popupRender: menuNode => (
                    <FilterDropdownContainer>
                        {searchable && <FilterDropdownSearch key={resetKey} onSearch={setSearch} disabled={loading} />}
                        {loading ? <KitLoader /> : menuNode}
                        <FilterDropdownFooter onReset={_handleReset} />
                    </FilterDropdownContainer>
                ),
                menu: {
                    items: filteredItems,
                    selectedKeys: value,
                    multiple: true,
                    onClick: _handleMenuClick,
                },
            }}
        />
    );
};
