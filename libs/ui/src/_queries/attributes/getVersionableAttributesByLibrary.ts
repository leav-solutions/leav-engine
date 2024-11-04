// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getVersionableAttributesByLibraryQuery = gql`
    query GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY($libraryId: String!) {
        attributes(filters: {libraries: [$libraryId], versionable: true}) {
            list {
                id
                versions_conf {
                    versionable
                    profile {
                        id
                        trees {
                            id
                            label
                        }
                    }
                }
            }
        }
    }
`;
