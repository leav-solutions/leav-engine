// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Divider} from 'semantic-ui-react';
import {IFormElementProps} from '../../../_types';

interface IUiDividerSettings {
    title?: string;
}

function UiDivider({settings}: IFormElementProps<IUiDividerSettings>): JSX.Element {
    return settings?.title ? <Divider horizontal>{settings?.title}</Divider> : <Divider />;
}

export default UiDivider;
