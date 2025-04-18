import {type FunctionComponent} from 'react';
import {page} from './layout.module.css';

export const PageLayout: FunctionComponent = ({children}) => (
    <section className={page}>
        {children}
    </section>
);
