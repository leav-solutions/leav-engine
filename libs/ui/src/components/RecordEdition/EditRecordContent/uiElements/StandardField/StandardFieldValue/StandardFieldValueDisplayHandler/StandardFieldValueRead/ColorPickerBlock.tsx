// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import styled from 'styled-components';

interface IColorPickerBlockProps {
    isValueDefaultColor: boolean;
    color: string;
}

const ColorPickerColorBlock = styled.div`
    height: 32px;
    width: 32px;
    border-radius: calc(var(--general-border-radius-xs) * 1px);
    box-shadow: inset 0 0 1px 0 rgba(0, 0, 0, 0.25);
    background-image: conic-gradient(
        rgba(0, 0, 0, 0.06) 0 25%,
        transparent 0 50%,
        rgba(0, 0, 0, 0.06) 0 75%,
        transparent 0
    );
    background-size: 50% 50%;
`;

const ColorPickerColorBlockInner = styled.div<{$color: string}>`
    width: 100%;
    height: 100%;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: calc(var(--general-border-radius-xs) * 1px);
    background-color: ${({$color}) => $color};
`;

const ColorPickerClear = styled.div`
    width: 24px;
    height: 24px;
    margin: calc(var(--general-spacing-xxs) * 1px) 0;
    border-radius: calc(var(--general-border-radius-xs) * 1px);
    border: 1px solid rgba(5, 5, 5, 0.06);
    position: relative;

    &::after {
        content: '';
        position: absolute;
        inset-inline-end: 1px;
        top: 0;
        display: block;
        width: 28px;
        height: 2px;
        transform-origin: right;
        transform: rotate(-45deg);
        background-color: var(--general-utilities-error-default);
    }
`;

export const ColorPickerBlock: FunctionComponent<IColorPickerBlockProps> = ({isValueDefaultColor, color}) =>
    isValueDefaultColor ? (
        <ColorPickerClear />
    ) : (
        <ColorPickerColorBlock>
            <ColorPickerColorBlockInner $color={color} />
        </ColorPickerColorBlock>
    );
