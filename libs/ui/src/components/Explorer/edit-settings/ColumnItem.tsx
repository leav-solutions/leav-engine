import {KitTypography} from 'aristid-ds';
import {FunctionComponent, ReactNode} from 'react';
import {FaChevronRight, FaEye, FaEyeSlash, FaGripLines} from 'react-icons/fa';
import styled from 'styled-components';

const StyledValue = styled(KitTypography.Text)`
    color: var(--general-utilities-disabled);
`;

const StyledConfigurationItem = styled.li`
    list-style: none;
    color: var(--general-utilities-text-primary);
    display: flex;
    width: 100%;
    height: 40px;
    padding: 0 calc(var(--general-spacing-xs) * 1px);
    align-items: center;
    gap: calc(var(--general-spacing-xs) * 1px);
    border-radius: calc(var(--general-spacing-xs) * 1px);
    text-align: left;

    &:first-child {
        margin-top: calc(var(--general-spacing-xs) * 1px);
    }

    &:hover {
        background: var(--general-utilities-main-light);

        ${StyledValue} {
            color: var(--general-utilities-text-primary);
        }
    }

    .title {
        flex: 1 1 auto;
    }

    > svg {
        flex: 0 0 calc(var(--general-spacing-s) * 1px);
    }

    > button {
        border: none;
        background: transparent;
        cursor: pointer;
        padding: 0;
    }
`;

const StyledFaEye = styled(FaEye).attrs<{$disabled: boolean}>({$disabled: false})`
    color: ${({$disabled}) => ($disabled ? 'var(--general-utilities-disabled)' : 'currentColor')};
    cursor: ${({$disabled}) => ($disabled ? 'default' : 'pointer')};
`;

const StyledEyeSlash = styled(FaEyeSlash)`
    color: var(--general-utilities-disabled);
    cursor: pointer;
`;

const StyledEmptyIcon = styled.div`
    width: calc(var(--general-spacing-s) * 1px);
`;

interface IColumnItemProps {
    dragHandler?: ReactNode;
    visible: boolean;
    title: string;
    onVisibilityClick?: () => void;
    disabled?: boolean;
    value?: string;
}

export const ColumnItem: FunctionComponent<IColumnItemProps> = ({
    dragHandler,
    title,
    disabled,
    visible,
    onVisibilityClick
}) => (
    <StyledConfigurationItem className={`${disabled ? 'disabled' : ''}`}>
        {dragHandler || <StyledEmptyIcon />}
        <KitTypography.Text size="fontSize5" ellipsis className="title">
            {title}
        </KitTypography.Text>
        <button className={`${disabled ? 'disabled' : ''}`} onClick={onVisibilityClick}>
            {visible ? <StyledFaEye /> : <StyledEyeSlash />}
        </button>
    </StyledConfigurationItem>
);
