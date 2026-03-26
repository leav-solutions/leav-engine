// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {KitFilter, KitLoader} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons';
import {FilterDropdownFooter} from './shared/FilterDropdownFooter';
import {FilterDropdownContainer} from './shared/FilterDropdownContainer';
import {FilterDropdownSearch} from './shared/FilterDropdownSearch';
import {useGetUsers} from './get-users/useGetUsers';

type UserFilterProps = {
    loading: boolean;
    value: string | null;
    onChange: (value: string | null) => void;
    onReset: () => void;
};

export const UserFilter = ({loading, value, onChange, onReset}: UserFilterProps) => {
    const {t} = useTranslation();
    const {fetchUsers, users, loading: usersLoading} = useGetUsers();
    const [search, setSearch] = useState('');
    const [resetKey, setResetKey] = useState(0);

    const _handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen && !users.length && !usersLoading) {
            fetchUsers();
        }
        if (!nextOpen) {
            setSearch('');
            setResetKey(k => k + 1);
        }
    };

    const items = users.map(user => ({
        key: user.id,
        label: user.email,
        extra:
            value === user.id ? (
                <FontAwesomeIcon color="var(--general-utilities-text-blue)" icon={faCheck} />
            ) : undefined,
    }));

    const filteredItems = search
        ? items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
        : items;

    const _handleMenuClick = ({key}: {key: string}) => {
        onChange(value === key ? null : key);
    };

    const _handleReset = () => {
        setSearch('');
        setResetKey(k => k + 1);
        onReset();
    };

    const selectedLabel = users.find(u => u.id === value)?.email ?? null;

    return (
        <KitFilter
            label={t('logs.filters.user.label')}
            active={value !== null}
            expandable
            showSingleValue
            disabled={loading}
            values={selectedLabel ? [selectedLabel] : []}
            dropDownProps={{
                onOpenChange: _handleOpenChange,
                dropdownRender: menuNode => (
                    <FilterDropdownContainer>
                        <FilterDropdownSearch key={resetKey} onSearch={setSearch} disabled={usersLoading} />
                        {usersLoading ? <KitLoader /> : menuNode}
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
