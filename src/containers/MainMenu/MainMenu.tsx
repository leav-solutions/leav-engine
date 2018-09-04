import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import AppMenu from '../../components/AppMenu';

interface IMainMenuProps {
    t: TranslationFunction;
}

class MainMenu extends React.Component<IMainMenuProps, any> {
    public state = {
        activeMenu: 'libraries'
    };

    public menuItems = [
        {
            id: 'libraries',
            label: this.props.t('libraries.title')
        },
        {
            id: 'attributes',
            label: this.props.t('attributes.title')
        },
        {
            id: 'trees',
            label: this.props.t('trees.title')
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

export default translate()(MainMenu);
