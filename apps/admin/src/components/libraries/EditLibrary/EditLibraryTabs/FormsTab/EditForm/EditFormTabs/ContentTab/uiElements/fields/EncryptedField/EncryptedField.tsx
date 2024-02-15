// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';

function EncryptedField(props: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {label = ''} = props.settings;
    const fieldProps = {
        label
    };

    return <Input type="password" {...fieldProps} />;
}

export default EncryptedField;
