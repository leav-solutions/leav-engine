import {forwardRef, type ReactNode} from 'react';
import {RootHeader} from './RootHeader';
import {ActivityCenterTarget} from './ActivityCenterTarget';
import {layout, mainContent} from './layout.module.css';

export const RootLayout = forwardRef<HTMLDivElement, {children: ReactNode}>(({children}, ref) => (
    // TODO : change the layout to use the new DS Grid component when it is available
    <main className={layout} ref={ref}>
        <RootHeader />
        <section className={mainContent}>
            {children}
            <ActivityCenterTarget />
        </section>
    </main>
));
