// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AttributeFormat,
    AttributeType,
    GetLibraryByIdQuery,
    LibraryBehavior,
    LibraryLightFragment
} from '_ui/_gqlTypes';

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
                file: null,
                original: 'icon/path.png',
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

export const mockLibraryWithPreviewsSettings = {
    ...mockLibraryWithDetails,
    previewsSettings: [
        {
            label: {fr: 'Ma config', en: 'My settings'},
            description: {fr: 'Ma description', en: 'My settings description'},
            system: true,
            versions: {
                background: '#123456',
                density: 300,
                sizes: [
                    {
                        name: 'my_size',
                        size: 200
                    },
                    {
                        name: 'my_size2',
                        size: 42
                    }
                ]
            }
        },
        {
            label: {en: 'Other settings'},
            description: {en: 'Other settings description'},
            system: false,
            versions: {
                background: 'false',
                density: 72,
                sizes: [
                    {
                        name: 'other_size',
                        size: 1024
                    },
                    {
                        name: 'other_size2',
                        size: 1337
                    }
                ]
            }
        }
    ]
};
