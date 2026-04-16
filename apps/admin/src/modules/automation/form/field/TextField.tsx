// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AntForm, KitInput} from 'aristid-ds';
import {type ComponentProps} from 'react';

type TextFieldProps = ComponentProps<typeof KitInput>;

/**
 * Wrapper around KitInput that automatically reads the validation status from
 * AntForm.Item context (FormItemInputContext) and passes it to KitInput.
 *
 * This is necessary because AntForm.Item does not inject `status` as a direct prop
 * via cloneElement. KitInput reads `status` from its explicit prop to color the label,
 * so without this wrapper the label stays black even when the field is in error state.
 */
export const TextField = ({name, disabled, required, ...props}: TextFieldProps) => {
    const {status, errors} = AntForm.Item.useStatus();

    const isInError = status === 'error';

    return (
        <KitInput
            {...props}
            status={isInError ? status : undefined}
            helper={isInError ? String(errors[0]) : undefined}
            htmlFor={name}
            disabled={disabled}
            required={required}
        />
    );
};
