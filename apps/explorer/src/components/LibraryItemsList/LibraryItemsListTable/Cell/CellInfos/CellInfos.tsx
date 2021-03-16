// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {HeartOutlined, InfoCircleOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu, Tooltip} from 'antd';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled, {CSSObject} from 'styled-components';
import {IconCross} from '../../../../../assets/icons/IconCross';
import {IconEllipsisHorizontal} from '../../../../../assets/icons/IconEllipsisHorizontal';
import {IconExpand} from '../../../../../assets/icons/IconExpand';
import themingVar from '../../../../../themingVar';
import {IRecordIdentityWhoAmI, PreviewSize} from '../../../../../_types/types';
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

interface ICellInfosProps {
    record: IRecordIdentityWhoAmI;
    size: PreviewSize;
    style?: CSSObject;
    lang?: string[];
    index: string;
    id: string;
    library: string;
}

function CellInfos({record, size, style, lang, index, id, library}: ICellInfosProps): JSX.Element {
    const {t} = useTranslation();

    const [isHover, setIsHover] = useState<boolean>(false);

    const actions = [
        {
            tooltip: t('items_list.table.actions-tooltips.informations'),
            icon: <InfoCircleOutlined />
        },
        {
            tooltip: t('items_list.table.actions-tooltips.expand'),
            icon: <IconExpand />
        },
        {
            tooltip: t('items_list.table.actions-tooltips.remove'),
            icon: <IconCross />
        }
    ];

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
        <Wrapper>
            <div style={{position: 'relative'}}>
                <CellSelection index={index} id={id} library={library} />
            </div>
            <div style={{position: 'relative'}} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <Info>
                    <CellRecordCard record={record} size={size} lang={lang} style={style} />
                </Info>
                <FloatingMenu className="floating-menu" isHover={isHover}>
                    {actions.map(action => (
                        <Tooltip title={action.tooltip} key={action.tooltip}>
                            <Button size="small" icon={action.icon} />
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
                </FloatingMenu>
            </div>
        </Wrapper>
    );
}

export default CellInfos;
