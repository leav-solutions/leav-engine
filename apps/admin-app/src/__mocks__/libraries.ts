// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
    defaultView: null,
    fullTextAttributes: [],
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
    ],
    permissions: {
        __typename: 'LibraryPermissions',
        admin_library: true,
        access_library: true,
        access_record: true,
        create_record: true,
        edit_record: true,
        delete_record: true
    }
};
