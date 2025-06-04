// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AntSkeleton, KitSpace} from 'aristid-ds';
import {FunctionComponent} from 'react';

export const PanelIdCardSkeleton: FunctionComponent = () => (
    <KitSpace direction="vertical">
        <AntSkeleton.Input
            active
            style={{
                width: '200px',
                height: 'calc(var(--general-typography-fontSize1) * var(--general-typography-lineHeight3) * 1px)'
            }}
        />
        <AntSkeleton.Input
            active
            style={{
                width: '200px',
                height: 'calc(var(--general-typography-fontSize5) * var(--general-typography-lineHeight5) * 1px)'
            }}
        />
    </KitSpace>
);
