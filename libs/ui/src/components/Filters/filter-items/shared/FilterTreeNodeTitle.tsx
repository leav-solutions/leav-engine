// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled from 'styled-components';
import {KitIdCard, KitTag, KitTypography} from 'aristid-ds';

const NodeTitleWrapper = styled.div`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 8px;
`;

export const FilterTreeNodeTitle = ({
    title,
    count,
    ghosted = false,
}: {
    title: string;
    count?: number;
    ghosted?: boolean;
}) => (
    // Ghosted nodes render must be handled manually in the KitTree component (ex in SmartFilterAttributeDropdown.tsx)
    <NodeTitleWrapper data-ghosted={ghosted}>
        <KitTypography.Text
            size="fontSize5"
            title="" // Set an empty title to avoid the browser tooltip from being displayed as KitTypography already has a one
            ellipsis
        >
            {title}
        </KitTypography.Text>
        {count !== undefined && (
            <KitTag type={ghosted ? 'neutral' : 'secondary'} size="small">
                <KitIdCard description={count} />
            </KitTag>
        )}
    </NodeTitleWrapper>
);
