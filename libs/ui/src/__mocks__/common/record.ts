import {type IPreviewScalar} from '@leav/utils';
import {type IRecordIdentityWhoAmI} from '../../types/records';

export const mockPreviews: IPreviewScalar = {
    tiny: '/fake/url/tiny.jpg',
    small: '/fake/url/small.jpg',
    medium: '/fake/url/medium.jpg',
    big: '/fake/url/big.jpg',
    huge: '/fake/url/huge.jpg',
    original: '/fake/url/original.jpg',
    file: null,
};

export const mockRecord = {
    id: '123456',
    label: 'record_label',
    subLabel: 'record_subLabel',
    library: {
        id: 'record_lib',
        label: {fr: 'Test Lib'},
    },
    preview: mockPreviews,
    color: 'blue',
} satisfies IRecordIdentityWhoAmI;
