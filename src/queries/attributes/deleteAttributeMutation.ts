// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {DELETE_ATTRIBUTE, DELETE_ATTRIBUTEVariables} from '../../_gqlTypes/DELETE_ATTRIBUTE';

export const DeleteAttributeMutation = p => Mutation<DELETE_ATTRIBUTE, DELETE_ATTRIBUTEVariables>(p);

export const deleteAttrQuery = gql`
    mutation DELETE_ATTRIBUTE($attrId: ID!) {
        deleteAttribute(id: $attrId) {
            id
        }
    }
`;
