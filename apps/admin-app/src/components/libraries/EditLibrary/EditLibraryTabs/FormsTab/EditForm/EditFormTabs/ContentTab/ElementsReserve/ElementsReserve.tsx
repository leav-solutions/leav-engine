// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Tab} from 'semantic-ui-react';
import {IFormBuilderStateAndDispatch} from '../formBuilderReducer/formBuilderReducer';
import AttributesList from './AttributesList';
import LayoutElementsList from './LayoutElementsList';

function ElementsReserve({state, dispatch}: IFormBuilderStateAndDispatch): JSX.Element {
    const {t} = useTranslation();

    const panes = [
        {
            menuItem: t('forms.layout'),
            render: () => (
                <Tab.Pane>
                    <LayoutElementsList state={state} dispatch={dispatch} />
                </Tab.Pane>
            )
        },
        {
            menuItem: t('forms.attributes'),
            render: () => (
                <Tab.Pane>
                    <AttributesList state={state} dispatch={dispatch} />
                </Tab.Pane>
            )
        }
    ];

    return <Tab panes={panes} />;
}

export default ElementsReserve;
