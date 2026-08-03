import {KitIdCard} from 'aristid-ds';
import {type IKitAvatar} from 'aristid-ds/dist/Kit/DataDisplay/Avatar/types';
import {type FunctionComponent} from 'react';
import {type RecordIdentityFragment} from '_ui/_gqlTypes';

interface IIdCardProps {
    item: RecordIdentityFragment['whoAmI'];
}

export const IdCard: FunctionComponent<IIdCardProps> = ({item}) => {
    const {id, label, preview, subLabel, color} = item;
    const itemLabel = label ?? id;
    const avatarProps: IKitAvatar = {label: itemLabel};

    if (preview) {
        avatarProps.src = preview.small as string;
    }

    return (
        <KitIdCard
            avatarProps={avatarProps}
            title={label ?? id}
            description={subLabel ?? undefined}
            color={color ?? undefined}
        />
    );
};
