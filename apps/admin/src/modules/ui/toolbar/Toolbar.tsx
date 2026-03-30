// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ReactNode} from 'react';
import {toolbarContainer, toolbar, leftContent, rightContent} from './toolbar.module.css';

type ToolbarProps = {
    extraAlignLeft?: ReactNode;
    extraAlignRight?: ReactNode;
};

export const Toolbar = ({extraAlignLeft, extraAlignRight}: ToolbarProps) => (
    <div className={toolbarContainer}>
        <div className={toolbar}>
            <div className={leftContent}>{extraAlignLeft}</div>
            <div className={rightContent}>{extraAlignRight}</div>
        </div>
    </div>
);
