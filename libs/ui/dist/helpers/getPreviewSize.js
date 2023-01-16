// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import { PreviewSize } from '../constants';
export const getPreviewSize = (size, simplistic = false) => {
    if (simplistic) {
        return '1.2rem';
    }
    switch (size) {
        case PreviewSize.medium:
            return '3.5rem';
        case PreviewSize.big:
            return '6rem';
        case PreviewSize.small:
            return '2.5rem';
        case PreviewSize.tiny:
            return '1.7rem';
        default:
            return '2rem';
    }
};
//# sourceMappingURL=getPreviewSize.js.map