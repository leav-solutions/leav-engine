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

/* tslint:disable-next-line:variable-name */
export const LibrariesQuery = p => Query<GET_ALL_PLUGINS>(p);
