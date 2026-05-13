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
