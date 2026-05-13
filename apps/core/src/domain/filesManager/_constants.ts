import {type ILibrary} from '../../_types/library';

export const systemPreviewsSettings: ILibrary['previewsSettings'] = [
    {
        label: {
            fr: 'Aperçu système',
            en: 'System preview',
        },
        description: null,
        system: true,
        versions: {
            background: false,
            density: 300,
            sizes: [
                {
                    size: 64,
                    name: 'tiny',
                },
                {
                    size: 128,
                    name: 'small',
                },
                {
                    size: 256,
                    name: 'medium',
                },
                {
                    size: 512,
                    name: 'big',
                },
                {
                    size: 1024,
                    name: 'huge',
                },
            ],
        },
    },
];
