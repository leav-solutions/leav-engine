import {gql} from '@apollo/client';

export const getLangs = gql`
    query GET_LANGS {
        langs
    }
`;
