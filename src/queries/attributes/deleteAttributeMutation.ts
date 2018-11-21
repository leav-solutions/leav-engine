import gql from 'graphql-tag';
import {Mutation} from 'react-apollo';
import {DELETE_ATTRIBUTE, DELETE_ATTRIBUTEVariables} from 'src/_gqlTypes/DELETE_ATTRIBUTE';

export class DeleteAttributeMutation extends Mutation<DELETE_ATTRIBUTE, DELETE_ATTRIBUTEVariables> {}

export const deleteAttrQuery = gql`
    mutation DELETE_ATTRIBUTE($attrId: ID!) {
        deleteAttribute(id: $attrId) {
            id
        }
    }
`;
