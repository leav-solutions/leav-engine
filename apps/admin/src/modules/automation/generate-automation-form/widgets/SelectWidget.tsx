// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitSelect} from 'aristid-ds';
import {type WidgetProps} from '@rjsf/utils';

export const SelectWidget = ({
    id,
    value,
    required,
    disabled,
    readonly,
    onChange,
    rawErrors,
    schema,
    options,
    placeholder,
}: WidgetProps) => {
    const {enumOptions} = options;

    const selectOptions = enumOptions?.map(opt => ({
        label: String(opt.label),
        value: opt.value as string | number,
    }));

    const hasError = rawErrors !== undefined && rawErrors.length > 0;

    return (
        <KitSelect
            id={id}
            value={value}
            placeholder={placeholder ?? schema.description}
            status={hasError ? 'error' : undefined}
            allowClear={!required}
            disabled={disabled || readonly}
            options={selectOptions}
            onChange={val => onChange(val)}
        />
    );
};
