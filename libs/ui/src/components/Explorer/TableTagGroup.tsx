import {KitTag} from 'aristid-ds';
import {type IKitTag} from 'aristid-ds/dist/Kit/DataDisplay/Tag/types';
import {type FunctionComponent} from 'react';
import styled from 'styled-components';

export const multiColorTagAvatarClassName = 'multi-color-tag-avatar';

const StyledTagsGroupDiv = styled.div`
    // TODO: wait DS to allow better customization on avatar
    &&& .${multiColorTagAvatarClassName} {
        height: calc(var(--general-spacing-s) * 1px);
        width: calc(var(--general-spacing-s) * 1px);
        border-radius: calc(var(--general-border-radius-xs) * 1px);
    }
`;

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
    <StyledTagsGroupDiv>
        <KitTag.Group tags={tags} othersTagType="primary" />
    </StyledTagsGroupDiv>
);
