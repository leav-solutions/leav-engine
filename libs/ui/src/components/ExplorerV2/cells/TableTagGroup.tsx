import {KitTag} from 'aristid-ds';
import {type IKitTag} from 'aristid-ds/dist/Kit/DataDisplay/Tag/types';
import {type FunctionComponent} from 'react';
import {tagsGroup} from './TableTagGroup.module.css';

export const multiColorTagAvatarClassName = 'multi-color-tag-avatar';

/**
 * ⚠️ Must be rendered into a block context of definite width (a table cell), never inside a
 * shrink-to-fit parent (flex/grid item, `inline-block`, float).
 *
 * `KitTag.Group` computes its overflow from its *own* box (`useTagGroup` → `containerRef.clientWidth`),
 * so in a shrink-to-fit parent the "available width" it reads is the width of the tags themselves —
 * a tautology. A single tag then collapses to "+1 autres" (and flickers, as the group's
 * `ResizeObserver` watches the very box whose width follows the computed result).
 */
export const TableTagGroup: FunctionComponent<{
    tags: IKitTag[];
}> = ({tags}) => (
    <div className={tagsGroup}>
        <KitTag.Group tags={tags} othersTagType="primary" />
    </div>
);
