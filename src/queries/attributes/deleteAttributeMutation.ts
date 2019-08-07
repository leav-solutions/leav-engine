import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {DELETE_ATTRIBUTE, DELETE_ATTRIBUTEVariables} from '../../_gqlTypes/DELETE_ATTRIBUTE';

/* tslint:disable-next-line:variable-name */
export const DeleteAttributeMutation = p => Mutation<DELETE_ATTRIBUTE, DELETE_ATTRIBUTEVariables>(p);

export const deleteAttrQuery = gql`
    mutation DELETE_ATTRIBUTE($attrId: ID!) {
        deleteAttribute(id: $attrId) {
            id
        }
    }
`;
