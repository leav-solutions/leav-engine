// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {GET_LIB_BY_ID_libraries_list} from '_gqlTypes/GET_LIB_BY_ID';
import {LibraryBehavior} from '../_gqlTypes/globalTypes';
import {mockAttrSimple, mockAttrSimpleLink} from './attributes';
import {mockRecord} from './common/records';

export const mockLibrary: WithTypename<GET_LIB_BY_ID_libraries_list> = {
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
    },
    icon: {
        whoAmI: {
            ...mockRecord
        }
    }
};
