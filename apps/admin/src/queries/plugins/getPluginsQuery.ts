// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getPluginsQuery = gql`
    query GET_ALL_PLUGINS {
        plugins {
            name
            description
            version
            author
        }
    }
`;
