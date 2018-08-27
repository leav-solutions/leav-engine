import * as React from 'react';
import {Link} from 'react-router-dom';
import {Icon, Menu} from 'semantic-ui-react';

export interface IAppMenuItem {
    id: string;
    label: string;
}

export interface IAppMenuProps {
    activeItem: string;
    items: IAppMenuItem[];
    onItemClick: (ev, elem) => void;
}

function AppMenu({activeItem, items, onItemClick}: IAppMenuProps): JSX.Element {
    return (
        <Menu vertical fluid inverted>
            <Menu.Item header position="left">
                <Icon name="cogs" />
                <strong>Admin</strong>
            </Menu.Item>
            <Menu.Menu>
                {items.map((item: IAppMenuItem) => (
                    <Menu.Item
                        className="menu_item"
                        key={item.id}
                        as={Link}
                        to={'/' + item.id}
                        name={item.id}
                        active={activeItem === item.id}
                        onClick={onItemClick}
                    >
                        <Icon name="angle right" />
                        {item.label}
                    </Menu.Item>
                ))}
            </Menu.Menu>
        </Menu>
    );
}

export default AppMenu;
