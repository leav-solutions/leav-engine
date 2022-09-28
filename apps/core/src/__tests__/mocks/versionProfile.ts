// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IVersionProfile} from '_types/versionProfile';

export const mockVersionProfile: IVersionProfile = {
    id: 'versionProfileId',
    label: {
        fr: 'Version Profile Label FR',
        en: 'Version Profile Label EN'
    },
    description: {
        fr: 'Version Profile Description FR',
        en: 'Version Profile Description EN'
    },
    trees: ['treeA', 'treeB']
};
