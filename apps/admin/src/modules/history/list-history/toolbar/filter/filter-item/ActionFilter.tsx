import {useState} from 'react';
import {KitFilter} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {LogAction} from '../../../../../../_gqlTypes';
import {FilterDropdownFooter} from './shared/FilterDropdownFooter';
import {FilterDropdownContainer} from './shared/FilterDropdownContainer';
import {FilterDropdownSearch} from './shared/FilterDropdownSearch';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons';

type ActionFilterProps = {
    loading: boolean;
    value: LogAction[];
    onChange: (value: LogAction[]) => void;
    onReset: () => void;
};

export const ActionFilter = ({loading, value, onChange, onReset}: ActionFilterProps) => {
    const {t} = useTranslation();
    const [search, setSearch] = useState('');
    const [resetKey, setResetKey] = useState(0);

    const items = Object.values(LogAction).map(action => ({
        key: action,
        label: action,
        extra: value.includes(action) ? (
            <FontAwesomeIcon color="var(--general-utilities-text-blue)" icon={faCheck} />
        ) : undefined,
    }));

    const filteredItems = search
        ? items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
        : items;

    const _handleMenuClick = ({key}: {key: string}) => {
        const action = key as LogAction;
        const next = value.includes(action) ? value.filter(v => v !== action) : [...value, action];
        onChange(next);
    };

    const _handleReset = () => {
        setSearch('');
        setResetKey(k => k + 1);
        onReset();
    };

    const _handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setSearch('');
            setResetKey(k => k + 1);
        }
    };

    return (
        <KitFilter
            label={t('logs.filters.action.label')}
            active={value.length > 0}
            expandable
            showSingleValue
            disabled={loading}
            values={value}
            dropDownProps={{
                onOpenChange: _handleOpenChange,
                popupRender: menuNode => (
                    <FilterDropdownContainer>
                        <FilterDropdownSearch key={resetKey} onSearch={setSearch} />
                        {menuNode}
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
