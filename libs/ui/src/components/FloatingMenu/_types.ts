// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ButtonSize} from 'antd/lib/button';

export interface IFloatingMenuActionWithBtn extends IFloatingMenuActionCommon {
    button?: React.ReactNode;
}

export interface IFloatingMenuActionWithIcon extends IFloatingMenuActionCommon {
    icon?: React.ReactNode;
    onClick?: () => void;
    size?: ButtonSize;
}

export interface IFloatingMenuActionCommon {
    title?: string;
}

export type FloatingMenuAction = IFloatingMenuActionWithIcon | IFloatingMenuActionWithBtn;
