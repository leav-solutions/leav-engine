// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import AttributeSelector from 'components/attributes/AttributeSelector';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {GET_ATTRIBUTESVariables} from '_gqlTypes/GET_ATTRIBUTES';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {ISettingsFieldCommonProps} from '../../../../_types';

export interface ISettingsAttributeProps extends ISettingsFieldCommonProps {
    library: string;
    filters?: GET_ATTRIBUTESVariables;
    multiple?: boolean;
}

function SettingsAttribute({
    onChange,
    fieldName,
    library,
    filters,
    multiple = false
}: ISettingsAttributeProps): JSX.Element {
    const {t} = useTranslation();
    const {
        state: {elementInSettings}
    } = useFormBuilderReducer();

    const _handleChange = (_, data) => onChange(data.name, data.value);
    const fieldValue = elementInSettings?.settings?.[fieldName] as string[];

    return (
        <AttributeSelector
            multiple={multiple}
            key={fieldName}
            placeholder={t('forms.select_attribute')}
            name={fieldName}
            onChange={_handleChange}
            filters={{
                ...filters,
                libraries: [library]
            }}
            fluid
            value={fieldValue}
        />
    );
}

export default SettingsAttribute;
