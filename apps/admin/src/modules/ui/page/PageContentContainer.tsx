import {pageContentContainer} from './pageContentContainer.module.css';
import {type ReactNode} from 'react';

type PageContentContainerProps = {
    children: ReactNode;
};

export const PageContentContainer = ({children}: PageContentContainerProps) => (
    <div className={pageContentContainer}>{children}</div>
);
