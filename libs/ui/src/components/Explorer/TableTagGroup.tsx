// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTag, KitTooltip} from 'aristid-ds';
import {IKitTag} from 'aristid-ds/dist/Kit/DataDisplay/Tag/types';
import {FunctionComponent} from 'react';
import styled from 'styled-components';

const StyledTagsGroupDiv = styled.div`
    display: flex;
    column-gap: calc(var(--general-spacing-xxs) * 1px);
    row-gap: calc(var(--general-spacing-xxs) * 0.5px);
    flex-wrap: wrap;

    & > span {
        margin-right: var(--general-spacing-none);
    }
`;

export const TableTagGroup: FunctionComponent<{
    tags: IKitTag[];
    maxTags?: number;
}> = ({tags, maxTags = 3}) => {
    const hiddenTags = tags.slice(maxTags);
    const visibleTags = tags.slice(0, maxTags);

    return (
        <StyledTagsGroupDiv>
            {visibleTags.map(tag => (
                <KitTag {...tag} />
            ))}
            {hiddenTags.length > 0 && (
                <KitTooltip
                    overlay={hiddenTags.map((hiddenTag, index) => (
                        <div key={index}>{hiddenTag.idCardProps?.description}</div>
                    ))}
                >
                    <KitTag type="primary" idCardProps={{description: `+${hiddenTags.length}`}} />
                </KitTooltip>
            )}
        </StyledTagsGroupDiv>
    );
};
