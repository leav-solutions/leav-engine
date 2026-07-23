import {type TypePolicies} from '@apollo/client';

/**
 * Shared Apollo cache typePolicies, used both by the production cache (ApolloHandler) and the test
 * cache (MockedProviderWithFragments), so tests exercise the same merge behaviour as production.
 *
 * The `merge` policies on singleton / list-wrapper Query fields silence the "Cache data may be lost
 * when replacing the X field of a Query object" warning: these fields return non-normalized objects
 * that Apollo cannot merge safely on its own, so we tell it to accept the incoming value.
 */
// A merge function that replaces the whole value instead of Apollo's default recursive field-by-field
// merge. Recursive merge descends into nested, non-normalized wrapper objects (LibraryList,
// AttributesList, GlobalSettings…) and emits "Cache data may be lost" warnings on their fields;
// replacing wholesale keeps the incoming value (the desired behaviour here) without recursing.
const replaceMerge = (_existing: unknown, incoming: unknown) => incoming;

export const cacheTypePolicies: TypePolicies = {
    Query: {
        fields: {
            attributes: {
                merge: replaceMerge,
            },
            libraries: {
                merge: replaceMerge,
            },
            trees: {
                merge: replaceMerge,
            },
            globalSettings: {
                merge: replaceMerge,
            },
            applicationSettings: {
                merge: replaceMerge,
            },
        },
    },
    RecordIdentity: {
        keyFields: ['id', 'library', ['id']],
    },
    // Tree is normalized, but its `settings` field is a JSON object with no identity of its own, so
    // replacing it wholesale avoids a merge warning when a tree is written back to the cache.
    Tree: {
        fields: {
            settings: {
                merge: replaceMerge,
            },
        },
    },
    Library: {
        fields: {
            attributes: {
                merge(existing, incoming) {
                    return incoming;
                },
            },
        },
    },
    VersionProfile: {
        fields: {
            linkedAttributes: {
                merge(existing, incoming) {
                    return incoming;
                },
            },
        },
    },
};
