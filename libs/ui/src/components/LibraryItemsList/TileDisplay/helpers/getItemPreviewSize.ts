// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {PreviewSize} from '_ui/constants';

const itemPreviewSize = {
    [PreviewSize.small]: '100px',
    [PreviewSize.medium]: '200px',
    [PreviewSize.big]: '300px'
};

export default (size: PreviewSize): string => itemPreviewSize[size];
