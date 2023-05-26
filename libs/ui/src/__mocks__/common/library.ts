// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AttributeFormat,
    AttributeType,
    GetLibraryByIdQuery,
    LibraryBehavior,
    LibraryLightFragment
} from '../../_gqlTypes';

export const mockLibrarySimple: LibraryLightFragment = {
    id: 'my_library',
    label: {
        fr: 'Ma bibliothèque',
        en: 'My library'
    },
    icon: {
        id: '123456789',
        whoAmI: {
            id: '123456789',
            library: {
                id: 'files'
            },
            preview: {
                huge: 'icon/path.png',
                big: 'icon/path.png',
                medium: 'icon/path.png',
                small: 'icon/path.png',
                tiny: 'icon/path.png'
            }
        }
    }
};

export const mockLibraryWithDetails: GetLibraryByIdQuery['libraries']['list'][0] = {
    id: 'my_library',
    label: {
        fr: 'Ma bibliothèque',
        en: 'My library'
    },
    behavior: LibraryBehavior.standard,
    fullTextAttributes: [{id: 'id', label: {fr: 'id', en: 'id'}}],
    system: false,
    attributes: [
        {
            id: 'my_attribute',
            label: {
                fr: 'Mon attribut',
                en: 'My attribute'
            },
            system: false,
            type: AttributeType.simple,
            format: AttributeFormat.text
        }
    ],
    permissions: {
        access_library: true,
        admin_library: true,
        access_record: true,
        create_record: true,
        delete_record: true,
        edit_record: true
    }
};
