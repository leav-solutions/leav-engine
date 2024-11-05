// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PreviewSize} from '_ui/constants';
import {ViewSizes} from '_ui/_gqlTypes';

export const displayTypeToPreviewSize = (displayType: ViewSizes) => {
    switch (displayType) {
        case ViewSizes.SMALL:
            return PreviewSize.small;
        case ViewSizes.MEDIUM:
            return PreviewSize.medium;
        case ViewSizes.BIG:
            return PreviewSize.big;
        default:
            return PreviewSize.small;
    }
};
