// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PossibleTypesMap} from '@apollo/client';

/**
 * This is a map of GraphQL interfaces with their possible types (the types which implement them).
 * This is used by the Apollo client to know which types to expect when querying an interface.
 * These possible types can be retrieved with a simple GraphQL query:
 * {
 *   __schema {
 *     types {
 *       name
 *       possibleTypes {
 *         name
 *       }
 *     }
 *   }
 * }
 *
 * As there are quite a few interfaces in the API, this map is used to avoid having to query the API on each app load.
 * More infos: https://www.apollographql.com/docs/react/data/fragments/#defining-possibletypes-manually
 */
export const gqlPossibleTypes: PossibleTypesMap = {
    Attribute: ['StandardAttribute', 'LinkAttribute', 'TreeAttribute'],
    StandardValuesListConf: ['StandardStringValuesListConf', 'StandardDateRangeValuesListConf'],
    GenericValue: ['Value', 'LinkValue', 'TreeValue']
};
