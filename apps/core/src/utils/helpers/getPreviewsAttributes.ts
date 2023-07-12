// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PREVIEWS_ATTRIBUTE_SUFFIX, PREVIEWS_STATUS_ATTRIBUTE_SUFFIX} from '../../_types/filesManager';

export const getPreviewsAttributeName = (libraryId: string) => `${libraryId}_${PREVIEWS_ATTRIBUTE_SUFFIX}`;

export const getPreviewsStatusAttributeName = (libraryId: string) => `${libraryId}_${PREVIEWS_STATUS_ATTRIBUTE_SUFFIX}`;
