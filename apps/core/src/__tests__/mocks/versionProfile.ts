import {type IVersionProfile} from '../../_types/versionProfile';

export const mockVersionProfile: IVersionProfile = {
    id: 'versionProfileId',
    label: {
        fr: 'Version Profile Label FR',
        en: 'Version Profile Label EN',
    },
    description: {
        fr: 'Version Profile Description FR',
        en: 'Version Profile Description EN',
    },
    trees: ['treeA', 'treeB'],
};
