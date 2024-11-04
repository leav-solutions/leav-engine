// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getInitials} from '@leav/utils';
import styled from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {getPreviewSize} from '_ui/_utils';

interface ISimplisticEntityPreviewProps {
    label: string;
}

const Wrapper = styled.div<{$size?: string}>`
    border-radius: 50%;
    border: 1px solid ${themeVars.borderColor};
    width: ${props => `calc(${props.$size} + 0.5rem)`};
    height: ${props => `calc(${props.$size} + 0.5rem)`};
    display: flex;
    align-items: center;
    justify-content: center;
`;

function SimplisticEntityPreview({label}: ISimplisticEntityPreviewProps): JSX.Element {
    const initial = getInitials(label, 1);
    const previewSize = getPreviewSize(null, true);

    return (
        <Wrapper $size={previewSize} data-testid="simplistic-preview">
            {initial}
        </Wrapper>
    );
}

export default SimplisticEntityPreview;
