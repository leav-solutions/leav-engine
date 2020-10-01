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
