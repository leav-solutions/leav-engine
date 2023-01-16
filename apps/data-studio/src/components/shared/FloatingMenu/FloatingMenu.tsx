// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dropdown, Tooltip} from 'antd';
import Button, {ButtonSize} from 'antd/lib/button';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import {IconEllipsisHorizontal} from 'assets/icons/IconEllipsisHorizontal';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';

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

export interface IFloatingMenuProps {
    actions: FloatingMenuAction[];
    moreActions?: IFloatingMenuActionWithIcon[];
    size?: SizeType;
    style?: CSSObject;
}

const FloatingMenuWrapper = styled.div<{overrideStyle?: CSSObject}>`
    position: absolute;
    z-index: 1000;
    right: 0;
    top: 0;

    display: flex;
    justify-content: space-around;
    padding: 0.5rem;

    & > * {
        margin: 0 0.2rem;
        box-shadow: 0px 2px 6px #0000002f;
    }

    ${p => p.overrideStyle}
`;

function FloatingMenu({actions, moreActions, style, size = 'small'}: IFloatingMenuProps): JSX.Element {
    const {t} = useTranslation();

    return (
        <FloatingMenuWrapper
            data-testid="floating-menu"
            className="floating-menu"
            style={style}
            onClick={e => {
                e.stopPropagation();
                e.preventDefault();
            }}
        >
            {actions.map((action, i) => (
                <Tooltip title={action.title} key={action.title ?? i}>
                    {(action as IFloatingMenuActionWithBtn).button ?? (
                        <Button
                            shape="circle"
                            size={(action as IFloatingMenuActionWithIcon).size}
                            icon={(action as IFloatingMenuActionWithIcon).icon}
                            onClick={(action as IFloatingMenuActionWithIcon).onClick}
                        />
                    )}
                </Tooltip>
            ))}
            {moreActions?.length && (
                <Tooltip title={t('items_list.table.actions-tooltips.more')} key="more_actions">
                    <Dropdown
                        placement="bottomRight"
                        menu={{
                            className: 'floating-menu-overlay',
                            items: moreActions.map(moreAction => ({
                                key: moreAction.title,
                                onClick: moreAction.onClick,
                                label: (
                                    <>
                                        {moreAction.icon} {moreAction.title}
                                    </>
                                )
                            }))
                        }}
                    >
                        <Button
                            size={size}
                            icon={<IconEllipsisHorizontal />}
                            aria-label={t('floating_menu.more_actions')}
                            title={t('floating_menu.more_actions')}
                            shape="circle"
                        />
                    </Dropdown>
                </Tooltip>
            )}
        </FloatingMenuWrapper>
    );
}

export default FloatingMenu;
