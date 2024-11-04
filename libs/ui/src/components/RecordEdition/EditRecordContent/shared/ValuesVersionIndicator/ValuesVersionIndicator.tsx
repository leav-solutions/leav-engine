// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {theme} from 'antd';
import {GlobalToken} from 'antd/lib/theme/interface';
import styled, {CSSObject} from 'styled-components';
import {themeVars} from '_ui/antdTheme';
import {VersionFieldScope} from '../../_types';

const Indicator = styled.div<{$isCurrentVersion: boolean; $style: CSSObject; $themeToken: GlobalToken}>`
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: ${p => (p.$isCurrentVersion ? 'none' : themeVars.inheritedValuesVersionColor)};
    width: 6px;
    z-index: 100;
    border-radius: ${p => p.$themeToken.borderRadius}px;;

    .first-value & {
        border-top-left-radius: ${p => p.$themeToken.borderRadius}}
    }

    ${p => p.$style}

    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
`;

interface IValuesVersionIndicatorProps {
    activeScope: VersionFieldScope;
    style?: CSSObject;
}

function ValuesVersionIndicator({activeScope, style}: IValuesVersionIndicatorProps): JSX.Element {
    const isCurrentVersion = activeScope === VersionFieldScope.CURRENT;
    const {token} = theme.useToken();

    return <Indicator $isCurrentVersion={isCurrentVersion} $style={style} $themeToken={token} />;
}

export default ValuesVersionIndicator;
