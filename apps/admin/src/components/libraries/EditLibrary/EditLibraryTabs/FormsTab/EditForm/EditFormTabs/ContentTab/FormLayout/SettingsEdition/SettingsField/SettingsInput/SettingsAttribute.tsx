import AttributeSelector from '../../../../../../../../../../../attributes/AttributeSelector';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {type GET_ATTRIBUTESVariables} from '../../../../../../../../../../../../_gqlTypes/GET_ATTRIBUTES';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {type ISettingsFieldCommonProps} from '../../../../_types';

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
    disabled,
    multiple = false,
}: ISettingsAttributeProps): JSX.Element {
    const {t} = useTranslation();
    const {
        state: {elementInSettings},
    } = useFormBuilderReducer();

    const _handleChange = (_, data) => onChange(data.name, data.value);
    const fieldValue = elementInSettings?.settings?.[fieldName] as string[];

    return (
        <AttributeSelector
            multiple={multiple}
            key={fieldName}
            disabled={disabled}
            placeholder={t('forms.select_attribute')}
            name={fieldName}
            onChange={_handleChange}
            filters={{
                ...filters,
                libraries: [library],
            }}
            fluid
            selection
            value={fieldValue}
        />
    );
}

export default SettingsAttribute;
