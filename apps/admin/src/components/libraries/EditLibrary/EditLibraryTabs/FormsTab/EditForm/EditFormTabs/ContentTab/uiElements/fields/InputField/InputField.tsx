import {Input} from 'semantic-ui-react';
import {type ICommonFieldsSettings, type IFormElementProps} from '../../../_types';
import {localizedLabel} from '../../../../../../../../../../../utils';
import useLang from '../../../../../../../../../../../hooks/useLang';

interface IInputFieldSettings extends ICommonFieldsSettings {
    type?: 'text' | 'number';
}

function InputField(props: IFormElementProps<IInputFieldSettings>): JSX.Element {
    const {label, type = 'text'} = props.settings;
    const {lang: availableLangs} = useLang();

    const fieldProps = {
        label: localizedLabel(label, availableLangs),
    };

    return <Input type={type} {...fieldProps} fluid />;
}

export default InputField;
