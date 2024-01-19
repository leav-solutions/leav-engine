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
