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
