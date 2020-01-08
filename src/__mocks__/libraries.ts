import {LibraryBehavior} from '../_gqlTypes/globalTypes';
import {mockAttrSimple, mockAttrSimpleLink} from './attributes';

export const mockLibrary = {
    __typename: 'Library',
    id: 'products',
    system: false,
    label: {
        en: 'Products',
        fr: 'Produits'
    },
    behavior: LibraryBehavior.standard,
    permissions_conf: null,
    recordIdentityConf: null,
    gqlNames: {
        query: 'products',
        type: 'Products',
        list: 'ProductsList',
        filter: 'ProductsFilter',
        searchableFields: 'ProductsSearchableFields',
        __typename: 'LibraryGraphqlNames'
    },
    attributes: [
        {
            ...mockAttrSimple,
            versions_conf: null,
            __typename: 'Attribute'
        },
        {
            ...mockAttrSimpleLink,
            versions_conf: null,
            __typename: 'Attribute'
        }
    ]
};
