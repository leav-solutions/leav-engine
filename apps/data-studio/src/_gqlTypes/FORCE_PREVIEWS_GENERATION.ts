// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {RecordFilterInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: FORCE_PREVIEWS_GENERATION
// ====================================================

export interface FORCE_PREVIEWS_GENERATION {
    /**
     * Force previews generation for the given records. If filters is specified, it will perform a search applying these filters and generate previews for results. If both filters and recordIds are specified, filters will be ignored. If failedOnly is true, only failed previews will be generated.
     */
    forcePreviewsGeneration: boolean;
}

export interface FORCE_PREVIEWS_GENERATIONVariables {
    libraryId: string;
    filters?: RecordFilterInput[] | null;
    recordIds?: string[] | null;
    failedOnly?: boolean | null;
    previewVersionSizeNames?: string[] | null;
}
