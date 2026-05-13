import {type FunctionComponent} from 'react';
import {AntSkeleton, KitSpace} from 'aristid-ds';

export const PanelIdCardSkeleton: FunctionComponent = () => (
    <KitSpace direction="vertical">
        <AntSkeleton.Input
            active
            style={{
                width: '200px',
                height: 'calc(var(--general-typography-fontSize1) * var(--general-typography-lineHeight3) * 1px)',
            }}
        />
        <AntSkeleton.Input
            active
            style={{
                width: '200px',
                height: 'calc(var(--general-typography-fontSize5) * var(--general-typography-lineHeight5) * 1px)',
            }}
        />
    </KitSpace>
);
