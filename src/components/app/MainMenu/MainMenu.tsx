import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import AppMenu from '../AppMenu';

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

    public render() {
        return <AppMenu items={this.menuItems} />;
    }
}

export default translate()(MainMenu);
