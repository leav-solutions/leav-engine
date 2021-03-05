// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import themingVar from 'themingVar';
import {IFormElementProps} from '../../_types';

function DateField({}: IFormElementProps<{}>): JSX.Element {
    // TODO: implement actual date field
    return <div style={{border: `1px solid ${themingVar['@leav-secondary-divider-color']}`}}>DATE</div>;
}

export default DateField;
