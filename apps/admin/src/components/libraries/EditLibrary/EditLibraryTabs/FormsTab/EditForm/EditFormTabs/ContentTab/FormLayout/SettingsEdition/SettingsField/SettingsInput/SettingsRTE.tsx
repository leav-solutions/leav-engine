import {KitInput, KitTypography} from 'aristid-ds';
import {type ComponentProps} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormBuilderReducer} from '../../../../formBuilderReducer/hook/useFormBuilderReducer';
import {type ISettingsFieldCommonProps} from '../../../../_types';

const MARKDOWN_HELP_URL = 'https://commonmark.org/help/';

function SettingsRTE({fieldName, onChange, disabled}: ISettingsFieldCommonProps): JSX.Element {
    const {t} = useTranslation();
    const {
        state: {elementInSettings},
    } = useFormBuilderReducer();

    const _handleChange: ComponentProps<typeof KitInput.TextArea>['onChange'] = event => {
        onChange(fieldName, event.target.value);
    };

    return (
        <div data-testid="rte-editor-wrapper">
            <KitInput.TextArea
                name={fieldName}
                id={fieldName}
                disabled={disabled}
                autoSize={{minRows: 4}}
                value={String(elementInSettings?.settings?.[fieldName] ?? '')}
                onChange={_handleChange}
            />
            <KitTypography.Link href={MARKDOWN_HELP_URL} target="_blank" rel="noopener noreferrer">
                {t('forms.rte.markdown_help')}
            </KitTypography.Link>
        </div>
    );
}

export default SettingsRTE;
