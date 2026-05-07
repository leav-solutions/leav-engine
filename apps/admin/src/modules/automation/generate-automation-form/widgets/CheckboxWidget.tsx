// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInputWrapper, KitSwitch, KitTypography} from 'aristid-ds';
import {type WidgetProps} from '@rjsf/utils';
import {useTranslation} from 'react-i18next';

export const CheckboxWidget = ({id, value, disabled, readonly, onChange, rawErrors, required, label}: WidgetProps) => {
    const {t} = useTranslation();

    const hasError = rawErrors !== undefined && rawErrors.length > 0;

    // Note: label is not displayed by default for boolean fields in rjsf — checkbox widget is responsible for rendering the label inline.
    return (
        <KitInputWrapper
            label={label}
            status={hasError ? 'error' : undefined}
            helper={hasError ? String(rawErrors[0]) : undefined}
            required={required}
        >
            <label
                id={id}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'calc(var(--general-spacing-xs) * 1px)',
                }}
            >
                <KitSwitch checked={!!value} onChange={checked => onChange(checked)} disabled={disabled || readonly} />
                <KitTypography.Text size="fontSize5" weight="medium">
                    {value ? t('admin.yes') : t('admin.no')}
                </KitTypography.Text>
            </label>
        </KitInputWrapper>
    );
};
