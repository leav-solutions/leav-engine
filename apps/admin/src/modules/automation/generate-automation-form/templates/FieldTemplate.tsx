// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FieldTemplateProps} from '@rjsf/utils';
import {KitInputWrapper} from 'aristid-ds';

export const FieldTemplate = ({displayLabel, children, label, rawErrors, required}: FieldTemplateProps) => {
    // RJSF sets displayLabel=false for: boolean fields without an explicit ui:widget (checkbox widget renders the label
    // inline), and nested object fields (their children each carry their own label via FieldTemplate).
    if (!displayLabel) {
        return <>{children}</>;
    }

    const hasError = rawErrors !== undefined && rawErrors.length > 0;

    return (
        <KitInputWrapper
            label={label}
            status={hasError ? 'error' : undefined}
            helper={hasError ? String(rawErrors[0]) : undefined}
            required={required}
        >
            {children}
        </KitInputWrapper>
    );
};
