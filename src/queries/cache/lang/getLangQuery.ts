import gql from 'graphql-tag';

export const getLangAll = gql`
    query GET_LANG_ALL {
        lang
        availableLangs
        defaultLang
    }
`;

export const getLangAndDefaultLang = gql`
    query GET_LANG_AND_DEFAULT_LANG {
        lang @client
        defaultLang @client
    }
`;

export const getLang = gql`
    query GET_LANG {
        lang @client
    }
`;

export const getDefaultLang = gql`
    query GET_DEFAULT_LANG {
        defaultLang @client
    }
`;

export const getAvailableLangs = gql`
    query GET_AVAILABLE_LANGS {
        availableLangs @client
        lang @client
    }
`;
