// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import styled, {CSSObject} from 'styled-components';
import themingVar from 'themingVar';
import {FieldScope} from '../../_types';

const Indicator = styled.div<{$isCurrentVersion: boolean; $style: CSSObject}>`
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: ${p => (p.$isCurrentVersion ? 'none' : themingVar['@leav-inherited-values-version-color'])};
    width: 6px;
    z-index: 100;
    border-radius: themingVar[ '@border-radius-base' ];

    .first-value & {
        border-top-left-radius: ${themingVar['@border-radius-base']};
    }

    ${p => p.$style}

    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
`;

interface IValuesVersionIndicatorProps {
    activeScope: FieldScope;
    style?: CSSObject;
}

function ValuesVersionIndicator({activeScope, style}: IValuesVersionIndicatorProps): JSX.Element {
    const isCurrentVersion = activeScope === FieldScope.CURRENT;
    return <Indicator $isCurrentVersion={isCurrentVersion} $style={style} />;
}

export default ValuesVersionIndicator;
