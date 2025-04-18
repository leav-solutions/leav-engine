import {type FunctionComponent} from 'react';
import {RootHeader} from './RootHeader';

import {layout, mainContent} from './layout.module.css';

export const RootLayout: FunctionComponent = ({children}) => (
    // TODO : change the layout to use the new DS Grid component when it is available
    <main className={layout}>
        <RootHeader />
        <section className={mainContent}>{children}</section>
    </main>
);
