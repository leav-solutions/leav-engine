// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {forwardRef, ReactNode} from 'react';
import {RootHeader} from './RootHeader';
import {SidebarContent} from './SidebarContent';
import {layout, mainContent} from './layout.module.css';

export const RootLayout = forwardRef<HTMLDivElement, {children: ReactNode}>(({children}, ref) => (
    // TODO : change the layout to use the new DS Grid component when it is available
    <main className={layout} ref={ref}>
        <RootHeader />
        <section className={mainContent}>
            {children}
            <SidebarContent />
        </section>
    </main>
));
