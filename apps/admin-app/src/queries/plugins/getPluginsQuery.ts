// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Query} from '@apollo/react-components';
import gql from 'graphql-tag';
import {GET_ALL_PLUGINS} from '../../_gqlTypes/GET_ALL_PLUGINS';

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

export const LibrariesQuery = p => Query<GET_ALL_PLUGINS>(p);
