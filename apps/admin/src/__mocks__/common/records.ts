import {type RecordIdentity_whoAmI} from '../../_gqlTypes/RecordIdentity';

export const mockRecord: RecordIdentity_whoAmI = {
    id: 'record-id',
    library: {
        id: 'library-id',
        label: {
            fr: 'Librairie',
            en: 'Library',
        },
    },
    label: 'My record',
    color: '#123456',
    preview: {
        tiny: 'path/to/preview.png',
        small: 'path/to/preview.png',
        medium: 'path/to/preview.png',
        big: 'path/to/preview.png',
        huge: 'path/to/preview.png',
        pdf: 'path/to/file.pdf',
        file: null,
        original: 'path/to/file.png',
    },
};
