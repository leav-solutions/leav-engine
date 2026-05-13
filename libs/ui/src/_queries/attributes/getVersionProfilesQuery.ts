import {gql} from '@apollo/client';

export const getVersionProfilesQuery = gql`
    query GET_VERSION_PROFILES($filters: VersionProfilesFiltersInput, $sort: SortVersionProfilesInput) {
        versionProfiles(filters: $filters, sort: $sort) {
            list {
                id
                label
            }
        }
    }
`;
