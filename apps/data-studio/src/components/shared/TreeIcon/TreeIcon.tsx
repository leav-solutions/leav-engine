// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ShareAltOutlined} from '@ant-design/icons';
import React from 'react';
import {CSSObject} from 'styled-components';

interface ITreeIconProps {
    style?: CSSObject;
    [key: string]: any; // antd doesn't provide a usable type for icon props
}

function TreeIcon({style, ...props}: ITreeIconProps): JSX.Element {
    return <ShareAltOutlined style={{...style, transform: 'rotate(90deg)'}} {...props} />;
}

export default TreeIcon;
