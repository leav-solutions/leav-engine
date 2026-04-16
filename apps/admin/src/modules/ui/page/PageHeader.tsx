// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
