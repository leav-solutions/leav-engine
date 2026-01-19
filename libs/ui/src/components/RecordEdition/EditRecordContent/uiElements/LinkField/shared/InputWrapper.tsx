// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitInputWrapper} from 'aristid-ds';
import styled, {css} from 'styled-components';

export const InputWrapper = styled(KitInputWrapper)<{$readonlyBackground: boolean}>`
    ${props =>
        props.$readonlyBackground &&
        css`
            .kit-input-wrapper-content {
                background-color: var(--general-utilities-neutral-light);
            }
        `}

    &.disabled {
        .kit-input-wrapper-content {
            background-color: var(--general-utilities-neutral-light);
        }
    }

    &.error:not(.disabled) {
        .kit-input-wrapper-content {
            background-color: var(--general-utilities-error-light);
        }
    }

    .ant-empty-image,
    .ant-empty-description {
        display: none;
    }
`;
