import {KitTypography} from 'aristid-ds';
import {type FunctionComponent, type ReactNode} from 'react';
import styled from 'styled-components';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';

const StyledValue = styled(KitTypography.Text)`
    color: var(--general-utilities-disabled);
`;

const StyledConfigurationItem = styled.li`
    list-style: none;

    &:first-child {
        margin-top: calc(var(--general-spacing-xs) * 1px);
    }

    > button {
        color: var(--general-utilities-text-primary);
        border: none;
        background: transparent;
        display: flex;
        width: 100%;
        height: 40px;
        align-items: center;
        padding: 0 calc(var(--general-spacing-xs) * 1px);
        gap: calc(var(--general-spacing-xs) * 1px);
        border-radius: calc(var(--general-spacing-xs) * 1px);
        text-align: left;
        cursor: pointer;

        &:hover {
            background: var(--general-utilities-main-light);

            ${StyledValue} {
                color: var(--general-utilities-text-primary);
            }
        }

        .title {
            flex: 1 1 auto;
        }

        .value {
            flex: 0 1 auto;
            text-align: right;
        }

        > svg {
            flex: 0 0 calc(var(--general-spacing-s) * 1px);
        }
    }
`;

interface ISettingItemProps {
    icon: ReactNode;
    title: string;
    onClick: () => void;
    value?: string;
}

export const SettingItem: FunctionComponent<ISettingItemProps> = ({icon, title, value = '', onClick}) => (
    <StyledConfigurationItem>
        <button onClick={onClick}>
            {icon}
            <KitTypography.Text size="fontSize5" ellipsis className="title">
                {title}
            </KitTypography.Text>
            <StyledValue size="fontSize5" ellipsis className="value">
                {value}
            </StyledValue>
            <FontAwesomeIcon icon={faChevronRight} />
        </button>
    </StyledConfigurationItem>
);
