import {PREVIEWS_ATTRIBUTE_SUFFIX, PREVIEWS_STATUS_ATTRIBUTE_SUFFIX} from '../../_types/filesManager';

export const getPreviewsAttributeName = (libraryId: string) => `${libraryId}_${PREVIEWS_ATTRIBUTE_SUFFIX}`;

export const getPreviewsStatusAttributeName = (libraryId: string) => `${libraryId}_${PREVIEWS_STATUS_ATTRIBUTE_SUFFIX}`;
