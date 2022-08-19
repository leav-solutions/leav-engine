// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useMenuItems from 'hooks/useMenuItems';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';
import {Icon, Menu, Transition} from 'semantic-ui-react';
import {SemanticICONS} from 'semantic-ui-react/dist/commonjs/generic';
import styled from 'styled-components';

const StyledMenu = styled(Menu)<{width: number}>`
    &&&&& {
        width: ${props => props.width}px;
        transition: width 0.3s;
        border: none;
        box-shadow: none;
        background: transparent;

        .item {
            color: inherit;
        }

        .item:hover {
            color: rgb(65, 131, 196);
        }
    }
`;

const ItemContent = styled.div`
    display: grid;
    grid-template-columns: 40px 1fr;
    align-items: center;
`;

const ToggleButton = styled.div<{isCollapsed: boolean; width: number}>`
    position: fixed;
    bottom: 0;
    left: 0;
    width: ${props => props.width}px;
    transition: width 0.3s;
    text-align: ${props => (props.isCollapsed ? 'center' : 'right')};
    padding: 0.5rem;
    cursor: pointer;
    font-size: 0.6rem;
`;

interface IAppMenuProps {
    isCollapsed: boolean;
    onToggle: () => void;
    width: number;
}

const AppMenu = ({isCollapsed, onToggle, width}: IAppMenuProps): JSX.Element => {
    const {t} = useTranslation();
    const menuItems = useMenuItems();
    const toggleIcon = isCollapsed ? 'angle double right' : 'angle double left';

    return (
        <>
            <StyledMenu size="large" vertical borderless width={width} icon={isCollapsed}>
                <Menu.Menu>
                    {menuItems.map(item => (
                        <Menu.Item key={item.id} as={NavLink} to={'/' + item.id} name={item.id} title={item.label}>
                            <ItemContent>
                                <Icon name={item.icon as SemanticICONS} size="big" {...item.iconProps} />
                                <Transition visible={!isCollapsed} animation="slide right" duration={300}>
                                    <span>{item.label}</span>
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
