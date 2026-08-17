import {KitFilter, KitInput, KitTypography} from 'aristid-ds';
import {type ComponentProps, useEffect, useRef, useState} from 'react';
import {filterItemContainer} from './TextFilter.module.css';
import {FilterDropdownFooter} from './FilterDropdownFooter';
import {FilterDropdownContainer} from './FilterDropdownContainer';
import {DEBOUNCE_DELAY_MS} from './constants';

type TextFilterProps = {
    label: string;
    value: string | null;
    onChange: (value: string | null) => void;
    onReset: () => void;
    disabled?: boolean;
    placeholder?: string;
};

export const TextFilter = ({label, value, onChange, onReset, disabled, placeholder}: TextFilterProps) => {
    const [inputValue, setInputValue] = useState(value ?? '');
    const [resetKey, setResetKey] = useState(0);
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

    const _handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setResetKey(k => k + 1);
        }
    };

    const _handleReset = () => {
        setResetKey(k => k + 1);
        onReset();
    };

    return (
        <KitFilter
            key={resetKey}
            label={label}
            active={value !== null}
            expandable
            showSingleValue
            disabled={disabled}
            values={value ? [value] : []}
            dropDownProps={{
                onOpenChange: _handleOpenChange,
                popupRender: () => (
                    <FilterDropdownContainer>
                        <div className={filterItemContainer}>
                            <KitTypography.Text size="fontSize6">{label}</KitTypography.Text>
                            <KitInput
                                placeholder={placeholder ?? label}
                                value={inputValue}
                                onChange={_handleChange}
                                allowClear
                                size="middle"
                            />
                        </div>
                        <FilterDropdownFooter onReset={_handleReset} />
                    </FilterDropdownContainer>
                ),
            }}
        />
    );
};
