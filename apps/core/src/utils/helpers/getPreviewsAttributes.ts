import {PREVIEWS_ATTRIBUTE_SUFFIX, PREVIEWS_STATUS_ATTRIBUTE_SUFFIX} from '../../_constants/systemAttributes';

export const getPreviewsAttributeName = (libraryId: string) => `${libraryId}_${PREVIEWS_ATTRIBUTE_SUFFIX}`;

export const getPreviewsStatusAttributeName = (libraryId: string) => `${libraryId}_${PREVIEWS_STATUS_ATTRIBUTE_SUFFIX}`;
