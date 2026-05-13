import {pageContainer} from './pageContainer.module.css';
import {type ReactNode} from 'react';

type PageContainerProps = {
    children: ReactNode;
};

export const PageContainer = ({children}: PageContainerProps) => <div className={pageContainer}>{children}</div>;
