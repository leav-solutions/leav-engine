import {type WithTypename} from '@leav/utils';
import {type GET_LIB_BY_ID_libraries_list} from '../_gqlTypes/GET_LIB_BY_ID';
import {LibraryBehavior} from '../_gqlTypes';
import {mockAttrSimple, mockAttrSimpleLink} from './attributes';
import {mockRecord} from './common/records';

export const mockLibrary: WithTypename<GET_LIB_BY_ID_libraries_list> = {
    __typename: 'Library',
    id: 'products',
    system: false,
    label: {
        en: 'Products',
        fr: 'Produits',
    },
    behavior: LibraryBehavior.standard,
    mandatoryAttribute: null,
    permissions_conf: null,
    recordIdentityConf: null,
    defaultView: null,
    fullTextAttributes: [],
    attributes: [
        {
            ...mockAttrSimple,
            versions_conf: null,
            __typename: 'Attribute',
        },
        {
            ...mockAttrSimpleLink,
            versions_conf: null,
            __typename: 'Attribute',
        },
    ],
    settings: {},
    permissions: {
        __typename: 'LibraryPermissions',
        admin_library: true,
        access_library: true,
        access_record: true,
        create_record: true,
        edit_record: true,
        delete_record: true,
    },
    icon: {
        whoAmI: {
            ...mockRecord,
        },
    },
};
