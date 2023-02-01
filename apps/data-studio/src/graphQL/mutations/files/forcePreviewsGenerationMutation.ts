// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const forcePreviewsGenerationMutation = gql`
    mutation FORCE_PREVIEWS_GENERATION(
        $libraryId: ID!
        $filters: [RecordFilterInput!]
        $recordIds: [ID!]
        $failedOnly: Boolean
    ) {
        forcePreviewsGeneration(
            libraryId: $libraryId
            filters: $filters
            recordIds: $recordIds
            failedOnly: $failedOnly
        )
    }
`;
