// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AntForm, KitInputWrapper, KitSwitch, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';

type BooleanFieldProps = {
    label: string;
    checked?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
};

/**
 * Wrapper around KitSwitch that automatically reads the validation status from
 * AntForm.Item context (FormItemInputContext) and passes it to KitSwitch.
 *
 * This is necessary because AntForm.Item does not inject `status` as a direct prop
 * via cloneElement. KitSwitch reads `status` from its explicit prop to color the label,
 * so without this wrapper the label stays black even when the field is in error state.
 */
export const BooleanField = ({label, checked, disabled, onChange}: BooleanFieldProps) => {
    const {t} = useTranslation();
    const {status, errors} = AntForm.Item.useStatus();
    const isInError = status === 'error';

    return (
        <KitInputWrapper
            label={label}
            status={isInError ? status : undefined}
            helper={isInError ? String(errors[0]) : undefined}
            required
        >
            <label
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'calc(var(--general-spacing-xs) * 1px)',
                }}
            >
                <KitSwitch checked={checked} onChange={onChange} disabled={disabled} />
                <KitTypography.Text size="fontSize5" weight="medium">
                    {checked ? t('admin.yes') : t('admin.no')}
                </KitTypography.Text>
            </label>
        </KitInputWrapper>
    );
};
