// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import type {IApplication} from './types';
import {Outlet} from 'react-router-dom';
import {NavigationMenu} from '../navigation-menu/NavigationMenu';
import {useNavigationMenu} from '../navigation-menu/useNavigationMenu';
import {PageLayout} from '../layout/PageLayout';

interface IApplicationProps {
    application: IApplication;
}

export const Application: FunctionComponent<IApplicationProps> = ({application}) => {
    const {isMenuOpen, handleToggleMenu} = useNavigationMenu();
    const items = application.workspaces.map((workspace) => ({
        key: workspace.id,
        title: workspace.title,
        icon: workspace.icon
    }));

    return (
        <>
            <NavigationMenu menuOpen={isMenuOpen} items={items} handleToggleMenu={handleToggleMenu} />
            <PageLayout>
                <Outlet context={application.workspaces} />
            </PageLayout>
        </>
    );
};
