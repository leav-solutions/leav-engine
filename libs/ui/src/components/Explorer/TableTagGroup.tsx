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

export const TableTagGroup: FunctionComponent<{
    tags: IKitTag[];
}> = ({tags}) => (
    <StyledTagsGroupDiv>
        <KitTag.Group tags={tags} othersTagType="primary" />
    </StyledTagsGroupDiv>
);
