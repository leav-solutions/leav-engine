// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PreviewSize} from '_types/types';

const itemPreviewSize = {
    [PreviewSize.small]: '100px',
    [PreviewSize.medium]: '200px',
    [PreviewSize.big]: '300px'
};

export default (size: PreviewSize): string => itemPreviewSize[size];
