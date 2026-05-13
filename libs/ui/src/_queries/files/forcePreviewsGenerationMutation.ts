import {gql} from '@apollo/client';

export const forcePreviewsGenerationMutation = gql`
    mutation FORCE_PREVIEWS_GENERATION(
        $libraryId: ID!
        $filters: [RecordFilterInput!]
        $recordIds: [ID!]
        $failedOnly: Boolean
        $previewVersionSizeNames: [String!]
    ) {
        forcePreviewsGeneration(
            libraryId: $libraryId
            filters: $filters
            recordIds: $recordIds
            failedOnly: $failedOnly
            previewVersionSizeNames: $previewVersionSizeNames
        )
    }
`;
