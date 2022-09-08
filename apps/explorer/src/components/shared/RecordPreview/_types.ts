// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CSSObject} from 'styled-components';
import {PreviewSize} from '_types/types';

export interface IRecordPreviewProps {
    label: string;
    color?: string;
    image?: string;
    style?: CSSObject;
    tile?: boolean;
    size?: PreviewSize;
    simplistic?: boolean;
}

export interface IGeneratedPreviewProps {
    bgColor: string;
    fontColor: string;
    size?: PreviewSize;
    style?: CSSObject;
    simplistic?: boolean;
}
