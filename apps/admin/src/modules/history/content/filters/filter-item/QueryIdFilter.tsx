// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitFilter, KitInput, KitTypography} from 'aristid-ds';
import {type ComponentProps, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {filterItemContainer} from './queryIdFilter.module.css';
import {FilterDropdownFooter} from './shared/FilterDropdownFooter';
import {FilterDropdownContainer} from './shared/FilterDropdownContainer';
import {DEBOUNCE_DELAY_MS} from '../constants';

type QueryIdFilterProps = {
    loading: boolean;
    value: string | null;
    onChange: (value: string | null) => void;
    onReset: () => void;
};

export const QueryIdFilter = ({loading, value, onChange, onReset}: QueryIdFilterProps) => {
    const {t} = useTranslation();
    const [inputValue, setInputValue] = useState(value ?? '');
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        setInputValue(value ?? '');

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [value]);

    const _handleChange: ComponentProps<typeof KitInput>['onChange'] = event => {
        const newValue = event.target.value;
        setInputValue(newValue);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            onChange(newValue.length > 0 ? newValue : null);
        }, DEBOUNCE_DELAY_MS);
    };

    return (
        <KitFilter
            label={t('logs.filters.query_id.label')}
            active={value !== null}
            expandable
            showSingleValue
            disabled={loading}
            values={value ? [value] : []}
            dropDownProps={{
                dropdownRender: () => (
                    <FilterDropdownContainer>
                        <div className={filterItemContainer}>
                            <KitTypography.Text size="fontSize6">{t('logs.filters.query_id.label')}</KitTypography.Text>
                            <KitInput
                                placeholder={t('logs.filters.query_id.label')}
                                value={inputValue}
                                onChange={_handleChange}
                                allowClear
                                size="middle"
                            />
                        </div>
                        <FilterDropdownFooter onReset={onReset} />
                    </FilterDropdownContainer>
                ),
            }}
        />
    );
};
