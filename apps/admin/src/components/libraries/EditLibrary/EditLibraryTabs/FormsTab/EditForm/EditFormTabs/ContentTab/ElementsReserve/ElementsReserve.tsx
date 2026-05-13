import React from 'react';
import {useTranslation} from 'react-i18next';
import {Tab} from 'semantic-ui-react';
import AttributesList from './AttributesList';
import LayoutElementsList from './LayoutElementsList';

function ElementsReserve(): JSX.Element {
    const {t} = useTranslation();

    const panes = [
        {
            menuItem: t('forms.layout'),
            render: () => (
                <Tab.Pane>
                    <LayoutElementsList />
                </Tab.Pane>
            ),
        },
        {
            menuItem: t('forms.attributes'),
            render: () => (
                <Tab.Pane>
                    <AttributesList />
                </Tab.Pane>
            ),
        },
    ];

    return <Tab panes={panes} />;
}

export default ElementsReserve;
