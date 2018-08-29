import * as React from 'react';
import AppMenu from '../components/AppMenu';

class MainMenu extends React.Component {
    public state = {
        activeMenu: 'libraries'
    };

    public menuItems = [
        {
            id: 'libraries',
            label: 'Libraries'
        },
        {
            id: 'attributes',
            label: 'Attributes'
        },
        {
            id: 'trees',
            label: 'Trees'
        }
    ];

    public handleItemClick = (e, {name}) => {
        this.setState({
            ...this.state,
            activeMenu: name
        });
    }

    public render() {
        return <AppMenu activeItem={this.state.activeMenu} items={this.menuItems} onItemClick={this.handleItemClick} />;
    }
}

export default MainMenu;
