import {useState} from 'react';
import {KitFilter, KitLoader} from 'aristid-ds';
import {FilterDropdownContainer} from './FilterDropdownContainer';
import {FilterDropdownFooter} from './FilterDropdownFooter';
import {FilterDropdownSearch} from './FilterDropdownSearch';
import {type FilterOption} from './types';

type SingleSelectFilterProps<TValue extends string> = {
    label: string;
    options: Array<FilterOption<TValue>>;
    value: TValue | null;
    onChange: (value: TValue | null) => void;
    onReset: () => void;
    disabled?: boolean;
    searchable?: boolean;
    loading?: boolean;
    onOpen?: () => void;
};

export const SingleSelectFilter = <TValue extends string>({
    label,
    options,
    value,
    onChange,
    onReset,
    disabled,
    searchable = false,
    loading = false,
    onOpen,
}: SingleSelectFilterProps<TValue>) => {
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
        onChange(value === key ? null : (key as TValue));
    };

    const _handleReset = () => {
        _clearSearch();
        onReset();
    };

    const selectedLabel = options.find(option => option.value === value)?.label ?? null;

    return (
        // `key={resetKey}` forces KitFilter to remount on every close: KitDropDown keeps rendering
        // the trigger button it cloned when the popup last opened, so an `onChange`/`onReset` that
        // fires from inside the popup (e.g. the footer's "Réinitialiser") is applied to the state
        // but the chip's `active`/`values` never visually update until the next open/close cycle.
        <KitFilter
            key={resetKey}
            label={label}
            active={value !== null}
            expandable
            showSingleValue
            disabled={disabled}
            values={selectedLabel ? [selectedLabel] : []}
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
                    selectedKeys: value ? [value] : [],
                    onClick: _handleMenuClick,
                },
            }}
        />
    );
};
