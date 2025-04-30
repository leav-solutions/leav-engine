// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import type {ComponentProps, FunctionComponent} from 'react';
import {IKitTabItem} from 'aristid-ds/dist/Kit/DataDisplay/Tabs/types';
import {IKitBreadcrumb} from 'aristid-ds/dist/Kit/Navigation/Breadcrumb/types';
import {KitIdCard, KitTabs} from 'aristid-ds';
import {pageHeader, headerContent, content} from './layout.module.css';

interface ITabProps extends IKitTabItem {
    onClick?: () => void;
}

interface IPageProps {
    title: string;
    subtitle?: string;
    breadcrumb?: IKitBreadcrumb;
    tabs?: ITabProps[];
}

export const Page: FunctionComponent<IPageProps> = ({title, subtitle, breadcrumb, tabs, children}) => {
    const onChangeTab: ComponentProps<typeof KitTabs>['onChange'] = key => {
        tabs.find(tab => tab.key === key)?.onClick?.();
    };

    return (
        <>
            <div className={pageHeader}>
                <div className={headerContent}>
                    {breadcrumb && <div>{breadcrumb}</div>}
                    <KitIdCard size="large" title={title} description={subtitle} />
                </div>
                {tabs && <KitTabs items={tabs} onChange={onChangeTab} />}
            </div>
            <div className={content}>{children}</div>
        </>
    );
};
