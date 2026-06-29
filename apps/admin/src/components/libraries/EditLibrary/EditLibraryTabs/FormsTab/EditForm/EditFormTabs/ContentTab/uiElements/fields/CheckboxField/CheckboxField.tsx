import {Checkbox} from 'semantic-ui-react';
import {type ICommonFieldsSettings, type IFormElementProps} from '../../../_types';
import useLang from '../../../../../../../../../../../hooks/useLang';
import {localizedLabel} from '../../../../../../../../../../../utils';

function CheckboxField(props: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {label} = props.settings;
    const {lang: availableLangs} = useLang();

    const fieldProps = {
        label: localizedLabel(label, availableLangs),
    };

    return <Checkbox toggle {...fieldProps} />;
}

export default CheckboxField;
