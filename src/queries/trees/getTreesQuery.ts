import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_TREES, GET_TREESVariables} from '../../_gqlTypes/GET_TREES';

export const getTreesQueryName = 'GET_TREES';

export const getTreesQuery = gql`
    query GET_TREES($id: ID, $label: String, $system: Boolean, $lang: [AvailableLanguage!]) {
        trees(id: $id, label: $label, system: $system) {
            id
            label(lang: $lang)
            system
            libraries
        }
    }
`;

export class TreesQuery extends Query<GET_TREES, GET_TREESVariables> {}
