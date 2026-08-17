import {useEffect, useRef, useState, type ComponentProps} from 'react';
import {KitInput} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagnifyingGlass} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';
import {DEBOUNCE_DELAY_MS} from './constants';

type FilterDropdownSearchProps = {
    onSearch: (value: string) => void;
    disabled?: boolean;
};

export const FilterDropdownSearch = ({onSearch, disabled}: FilterDropdownSearchProps) => {
    const {t} = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        },
        [],
    );

    const _handleChange: ComponentProps<typeof KitInput>['onChange'] = e => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => onSearch(newValue), DEBOUNCE_DELAY_MS);
    };

    return (
        <KitInput
            prefix={<FontAwesomeIcon icon={faMagnifyingGlass} />}
            placeholder={t('admin.search')}
            size="middle"
            value={inputValue}
            onChange={_handleChange}
            disabled={disabled}
        />
    );
};
