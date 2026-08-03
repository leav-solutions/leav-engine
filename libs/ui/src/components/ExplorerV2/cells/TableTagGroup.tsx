import {KitTag} from 'aristid-ds';
import {type IKitTag} from 'aristid-ds/dist/Kit/DataDisplay/Tag/types';
import {type FunctionComponent} from 'react';
import {tagsGroup} from './TableTagGroup.module.css';

export const multiColorTagAvatarClassName = 'multi-color-tag-avatar';

export const TableTagGroup: FunctionComponent<{
    tags: IKitTag[];
}> = ({tags}) => (
    <div className={tagsGroup}>
        <KitTag.Group tags={tags} othersTagType="primary" />
    </div>
);
