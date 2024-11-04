// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CSSObject} from 'styled-components';
import {PreviewSize} from '../../constants';

export interface IEntityPreviewProps {
    label: string;
    color?: string;
    image?: string;
    style?: React.CSSProperties & CSSObject;
    imageStyle?: React.CSSProperties & CSSObject;
    placeholderStyle?: React.CSSProperties & CSSObject;
    tile?: boolean;
    size?: PreviewSize;
    simplistic?: boolean;
}

export interface IGeneratedPreviewProps {
    $bgColor: string;
    $fontColor: string;
    $size?: PreviewSize;
    style?: React.CSSProperties & CSSObject;
    $simplistic?: boolean;
}
