// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import {ICommonFieldsSettings, IFormElementProps} from '../../../_types';
import {localizedLabel} from 'utils';
import useLang from 'hooks/useLang';

function DropdownField({settings}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {lang: availableLangs} = useLang();

    const _label = localizedLabel(settings.label, availableLangs);

    return (
        <>
            <label>{_label}</label>
            <Dropdown {...settings} />
        </>
    );
}

export default DropdownField;
