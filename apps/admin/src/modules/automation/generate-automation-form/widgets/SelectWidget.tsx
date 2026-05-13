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
