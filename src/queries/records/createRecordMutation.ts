import gql from 'graphql-tag';
import {recordIdentityFragment} from './recordIdentityFragment';

export const createRecordQuery = gql`
    ${recordIdentityFragment}
    mutation CREATE_RECORD($library: ID!, $lang: [AvailableLanguage!]) {
        createRecord(library: $library) {
            id
            ...RecordIdentity
        }
    }
`;
