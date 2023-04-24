// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getInitials} from '@leav/utils';
import styled from 'styled-components';
import {themeVars} from '../../../../antdTheme';
import {getPreviewSize} from '../../../../helpers/getPreviewSize';

interface ISimplisticEntityPreviewProps {
    label: string;
}

const Wrapper = styled.div`
    border-radius: 50%;
    border: 1px solid ${themeVars.borderColor};
    width: calc(${getPreviewSize(null, true)} + 0.5rem);
    height: calc(${getPreviewSize(null, true)} + 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
`;

function SimplisticEntityPreview({label}: ISimplisticEntityPreviewProps): JSX.Element {
    const initial = getInitials(label, 1);

    return <Wrapper data-testid="simplistic-preview">{initial}</Wrapper>;
}

export default SimplisticEntityPreview;
