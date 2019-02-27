import React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import AppMenu from '../AppMenu';

class MainMenu extends React.Component<WithNamespaces> {
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
        },
        {
            id: 'permissions',
            label: this.props.t('permissions.title')
        }
    ];

    public render() {
        return <AppMenu items={this.menuItems} />;
    }
}

export default withNamespaces()(MainMenu);
