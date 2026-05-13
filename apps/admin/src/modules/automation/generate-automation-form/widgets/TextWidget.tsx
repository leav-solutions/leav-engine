import {KitInput} from 'aristid-ds';
import {type WidgetProps} from '@rjsf/utils';

export const TextWidget = ({
    id,
    value,
    disabled,
    readonly,
    onChange,
    rawErrors,
    placeholder,
    options,
    schema,
}: WidgetProps) => {
    const fieldPlaceholder = options.placeholder ?? placeholder ?? schema.description;
    const hasError = rawErrors !== undefined && rawErrors.length > 0;

    return (
        <KitInput
            id={id}
            value={value ?? ''}
            placeholder={fieldPlaceholder}
            readonly={disabled || readonly}
            status={hasError ? 'error' : undefined}
            onChange={e => onChange(e.target.value === '' ? undefined : e.target.value)}
        />
    );
};
