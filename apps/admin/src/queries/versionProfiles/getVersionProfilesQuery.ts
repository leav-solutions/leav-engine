// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
