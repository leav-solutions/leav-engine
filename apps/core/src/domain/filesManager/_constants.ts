// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPreviewVersion} from '_types/filesManager';

export const systemPreviewVersions: IPreviewVersion[] = [
    {
        background: false,
        density: 300,
        sizes: [
            {
                size: 64,
                name: 'tiny'
            },
            {
                size: 128,
                name: 'small'
            },
            {
                size: 256,
                name: 'medium'
            },
            {
                size: 512,
                name: 'big'
            },
            {
                size: 1024,
                name: 'huge'
            }
        ]
    }
];
