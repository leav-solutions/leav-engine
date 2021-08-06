// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {HeartOutlined, InfoCircleOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu, Tooltip} from 'antd';
import {SizeType} from 'antd/lib/config-provider/SizeContext';
import EditRecordBtn from 'components/RecordEdition/EditRecordBtn';
import {SelectionModeContext} from 'context';
import React, {useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useAppDispatch, useAppSelector} from 'redux/store';
import styled, {CSSObject} from 'styled-components';
import {IconCross} from '../../../../../assets/icons/IconCross';
import {IconEllipsisHorizontal} from '../../../../../assets/icons/IconEllipsisHorizontal';
import themingVar from '../../../../../themingVar';
import {DisplaySize, IRecordIdentityWhoAmI, ISharedSelected, PreviewSize} from '../../../../../_types/types';
import CellRecordCard from '../CellRecordCard';
import CellSelection from '../CellSelection';

const Wrapper = styled.div`
    display: grid;
    grid-template-columns: 2rem auto;
`;

const Info = styled.div`
    border-left: 1px solid ${themingVar['@divider-color']};
`;

interface IFloatingMenuProps {
    isHover: boolean;
}

interface IAction {
    tooltip: string;
    icon?: JSX.Element;
    button?: JSX.Element;
}

const FloatingMenu = styled.div<IFloatingMenuProps>`
    position: absolute;
    z-index: 1000;
    right: 18px;
    top: 15px;
    border: 1px solid ${themingVar['@divider-color']};
    border-radius: 3px;
    background-color: ${themingVar['@default-bg']};

    display: ${({isHover}) => (isHover ? 'flex' : 'none')};
    justify-content: space-around;
    padding: 0.3rem 0;
    transform: scale(0.7) translate(48px, -28px);

    & > * {
        margin: 0 0.2rem;
        box-shadow: 0px 2px 6px #0000002f;
    }
`;

const getSize = (size: DisplaySize): CSSObject => {
    let cssSize: string;
    switch (size) {
        case DisplaySize.small:
            cssSize = '3rem';
            break;
        case DisplaySize.medium:
            cssSize = '5rem';
            break;
        case DisplaySize.big:
            cssSize = '8rem';
            break;
    }
    return {height: cssSize, width: cssSize};
};

interface ICellInfosProps {
    record: IRecordIdentityWhoAmI;
    previewSize: PreviewSize;
    lang?: string[];
    index: string;
    selectionData: ISharedSelected;
}

function CellInfos({record, previewSize, lang, index, selectionData}: ICellInfosProps): JSX.Element {
    const {t} = useTranslation();

    const {display} = useAppSelector(state => ({display: state.display}));
    const selectionMode = useContext(SelectionModeContext);
    const [isHover, setIsHover] = useState<boolean>(false);

    const btnSize: SizeType = 'small';

    const actions: IAction[] = [
        {
            tooltip: t('items_list.table.actions-tooltips.informations'),
            icon: <InfoCircleOutlined />
        },
        {
            tooltip: t('items_list.table.actions-tooltips.expand'),
            button: <EditRecordBtn size={btnSize} record={record} />
        },
        {
            tooltip: t('items_list.table.actions-tooltips.remove'),
            icon: <IconCross />
        }
    ];

    const selectionModeActions = [actions[0]];

    const moreActions = [
        {
            tooltip: t('items_list.table.actions-tooltips.favorite'),
            icon: <HeartOutlined />
        }
    ];

    const handleMouseEnter = () => {
        setIsHover(true);
    };

    const handleMouseLeave = () => {
        setIsHover(false);
    };

    return (
        <>
            <Wrapper>
                <div style={{position: 'relative'}}>
                    <CellSelection selectionData={selectionData} />
                </div>
                <div style={{position: 'relative'}} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <Info>
                        <CellRecordCard record={record} size={previewSize} lang={lang} style={getSize(display.size)} />
                    </Info>
                    <FloatingMenu data-testid="floating-menu" className="floating-menu" isHover={isHover}>
                        {!selectionMode ? (
                            <>
                                {actions.map(action => (
                                    <Tooltip title={action.tooltip} key={action.tooltip}>
                                        {action.button ?? <Button size={btnSize} icon={action.icon} />}
                                    </Tooltip>
                                ))}
                                <Tooltip title={t('items_list.table.actions-tooltips.more')}>
                                    <Dropdown
                                        placement="bottomRight"
                                        overlay={
                                            <Menu className="floating-menu-overlay">
                                                {moreActions.map(moreAction => (
                                                    <Menu.Item key={moreAction.tooltip}>
                                                        {moreAction.icon} {moreAction.tooltip}
                                                    </Menu.Item>
                                                ))}
                                            </Menu>
                                        }
                                    >
                                        <Button size="small" icon={<IconEllipsisHorizontal />} />
                                    </Dropdown>
                                </Tooltip>
                            </>
                        ) : (
                            selectionModeActions.map(action => (
                                <Tooltip title={action.tooltip} key={action.tooltip}>
                                    <Button size="small" icon={action.icon} />
                                </Tooltip>
                            ))
                        )}
                    </FloatingMenu>
                </div>
            </Wrapper>
        </>
    );
}

export default CellInfos;
