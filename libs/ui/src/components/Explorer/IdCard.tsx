// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitIdCard} from 'aristid-ds';
import {IKitAvatar} from 'aristid-ds/dist/Kit/DataDisplay/Avatar/types';
import {FunctionComponent} from 'react';
import {RecordIdentityFragment} from '_ui/_gqlTypes';

interface IIdCardProps {
    item: RecordIdentityFragment['whoAmI'];
}

export const IdCard: FunctionComponent<IIdCardProps> = ({item}) => {
    const {id, label, library, preview, subLabel} = item;
    const itemLabel = label ?? id;
    const avatarProps: IKitAvatar = {label: itemLabel};

    if (preview) {
        avatarProps.src = preview.small;
    }

    return <KitIdCard avatarProps={avatarProps} title={label ?? id} description={subLabel ?? library.id} />;
};
