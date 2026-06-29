import {Dropdown} from 'semantic-ui-react';
import {type ICommonFieldsSettings, type IFormElementProps} from '../../../_types';
import {localizedLabel} from '../../../../../../../../../../../utils';
import useLang from '../../../../../../../../../../../hooks/useLang';

function DropdownField({settings}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {lang: availableLangs} = useLang();

    const label = localizedLabel(settings.label, availableLangs);

    return (
        <>
            <label>{label}</label>
            <Dropdown {...settings} />
        </>
    );
}

export default DropdownField;
