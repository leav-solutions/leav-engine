// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitTypography} from 'aristid-ds';
import {FunctionComponent, ReactNode} from 'react';
import {FaEye, FaEyeSlash} from 'react-icons/fa';
import styled from 'styled-components';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

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
        padding: 0;
        &:not([disabled]) {
            cursor: pointer;
        }
    }
`;

const StyledFaEye = styled(FaEye)`
    color: currentColor;
`;

const StyledEyeSlash = styled(FaEyeSlash)`
    color: var(--general-utilities-disabled);
`;

const StyledDragHandle = styled.span<{$isDragging: boolean}>`
    cursor: ${props => (props.$isDragging ? 'grabbing' : 'grab')};
`;

const StyledEmptyIcon = styled.div`
    width: calc(var(--general-spacing-s) * 1px);
`;

interface IColumnItemProps {
    itemId: string;
    dragHandler?: ReactNode;
    visible: boolean;
    title: string;
    onVisibilityClick?: () => void;
    disabled?: boolean;
    value?: string;
}

export const ColumnItem: FunctionComponent<IColumnItemProps> = ({
    itemId,
    dragHandler,
    title,
    disabled,
    visible,
    onVisibilityClick
}) => {
    const {t} = useSharedTranslation();
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: itemId});
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const _handleClick = () => {
        if (onVisibilityClick) {
            onVisibilityClick();
        }
    };

    const visibilityButtonLabel = visible ? t('explorer.hide') : t('explorer.show');
    return (
        <StyledConfigurationItem className={disabled ? 'disabled' : ''} ref={setNodeRef} style={style}>
            {dragHandler ? (
                <StyledDragHandle {...attributes} {...listeners} $isDragging={isDragging}>
                    {dragHandler}
                </StyledDragHandle>
            ) : (
                <StyledEmptyIcon />
            )}
            <KitTypography.Text size="fontSize5" ellipsis className="title">
                {title}
            </KitTypography.Text>
            <button
                disabled={disabled}
                onClick={_handleClick}
                title={visibilityButtonLabel}
                aria-label={visibilityButtonLabel}
            >
                {visible ? <StyledFaEye /> : <StyledEyeSlash />}
            </button>
        </StyledConfigurationItem>
    );
};
