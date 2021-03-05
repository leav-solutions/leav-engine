// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormDividerSettings} from '@leav/types';
import {Divider} from 'antd';
import React from 'react';
import {IFormElementProps} from '../../_types';

function FormDivider({element}: IFormElementProps<IFormDividerSettings>): JSX.Element {
    const label = element.settings.title ?? null;
    return <Divider>{label}</Divider>;
}

export default FormDivider;
