import gql from 'graphql-tag';

// const lang = process.env.REACT_APP_AVAILABLE_LANG ? process.env.REACT_APP_AVAILABLE_LANG.split(',').join(' ') : 'en';
export const attributeDetailsFragment = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        label(lang: $lang)
    }
`;
