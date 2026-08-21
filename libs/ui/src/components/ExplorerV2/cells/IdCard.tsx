import {KitIdCard} from 'aristid-ds';
import {type IKitAvatar} from 'aristid-ds/dist/Kit/DataDisplay/Avatar/types';
import {type FunctionComponent} from 'react';
import {type RecordIdentityFragment} from '_ui/_gqlTypes';

const NO_COLOR = 'transparent';

interface IIdCardProps {
    item: RecordIdentityFragment['whoAmI'];
    hasColorConfigured?: boolean;
}

export const IdCard: FunctionComponent<IIdCardProps> = ({item, hasColorConfigured = true}) => {
    const {id, label, preview, subLabel, color} = item;
    const itemLabel = label ?? id;
    const avatarProps: IKitAvatar = {label: itemLabel, shape: 'square'};

    if (preview) {
        avatarProps.src = preview.small as string;
    }

    return (
        <KitIdCard
            size="xxs-medium"
            avatarProps={avatarProps}
            title={label ?? id}
            description={subLabel ?? undefined}
            color={hasColorConfigured ? (color ?? NO_COLOR) : (color ?? undefined)}
        />
    );
};
