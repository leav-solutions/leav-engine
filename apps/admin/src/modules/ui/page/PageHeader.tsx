import {type ReactNode} from 'react';
import {leftContent, pageHeader, rightContent} from './pageHeader.module.css';

type PageHeaderProps = {
    extraAlignLeft?: ReactNode;
    extraAlignRight?: ReactNode;
};

export const PageHeader = ({extraAlignLeft, extraAlignRight}: PageHeaderProps) => (
    <div className={pageHeader}>
        <div className={leftContent}>{extraAlignLeft}</div>
        <div className={rightContent}>{extraAlignRight}</div>
    </div>
);
