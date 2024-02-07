// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useMenuItems from 'hooks/useMenuItems';
import {NavLink} from 'react-router-dom-v5';
import {Icon, Menu, Transition} from 'semantic-ui-react';
import styled from 'styled-components';

const StyledMenu = styled(Menu)<{width: number}>`
    &&&&& {
        width: ${props => props.width - 1}px; // -1 to avoid border issues
        transition: width 0.3s;
        border: none;
        box-shadow: none;
        background: transparent;
        margin-top: 1rem;
    }
`;

const ItemContent = styled.div`
    display: grid;
    grid-template-columns: 20px 1fr;
    align-items: center;
    grid-gap: 1rem;
`;

const ToggleButton = styled.div<{isCollapsed: boolean; width: string}>`
    position: fixed;
    bottom: 0;
    left: 0;
    width: ${props => props.width};
    transition: width 0.3s;
    text-align: ${props => (props.isCollapsed ? 'center' : 'right')};
    padding: 0.5rem;
    cursor: pointer;
    font-size: 0.6rem;
`;

const ItemLabel = styled.span`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

interface IAppMenuProps {
    isCollapsed: boolean;
    onToggle: () => void;
    width: string;
}

const AppMenu = ({isCollapsed, onToggle, width}: IAppMenuProps): JSX.Element => {
    const menuItems = useMenuItems({size: 'small'});
    const toggleIcon = isCollapsed ? 'angle double right' : 'angle double left';

    return (
        <>
            <StyledMenu size="large" vertical borderless width={width} icon={isCollapsed}>
                <Menu.Menu>
                    {menuItems.map(item => (
                        <Menu.Item
                            key={item.id}
                            as={NavLink}
                            to={'/' + item.id}
                            name={item.id}
                            title={item.label}
                            style={{width: `calc(${width} - 1px)`}}
                        >
                            <ItemContent>
                                {item.icon}
                                <Transition visible={!isCollapsed} animation="slide right" duration={300}>
                                    <ItemLabel>{item.label}</ItemLabel>
                                </Transition>
                            </ItemContent>
                        </Menu.Item>
                    ))}
                </Menu.Menu>
            </StyledMenu>
            <ToggleButton onClick={onToggle} width={width} isCollapsed={isCollapsed}>
                <Icon name={toggleIcon} size="big" />
            </ToggleButton>
        </>
    );
};

export default AppMenu;
