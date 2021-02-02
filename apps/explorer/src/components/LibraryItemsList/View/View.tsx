// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreFilled, EllipsisOutlined} from '@ant-design/icons';
import {Button, Dropdown, Menu} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IconViewList} from '../../../assets/icons/IconViewList';
import {useStateItem} from '../../../Context/StateItemsContext';
import themingVar from '../../../themingVar';
import {IView, ViewType} from '../../../_types/types';
import {LibraryItemListReducerActionTypes} from '../LibraryItemsListReducer';

interface IWrapperProps {
    selected: boolean;
}

const Wrapper = styled.div<IWrapperProps>`
    position: relative;
    width: 100%;
    padding: 1rem;
    background: ${({selected}) => (selected ? `${themingVar['@leav-view-panel-background-active']} ` : 'none')};

    &::before {
        content: '';
        position: absolute;
        padding: 5px;
        border-radius: 50%;
        left: 18px;
        top: 28px;
        background: ${({color}) => color ?? themingVar['@primary-color']};
    }

    & > div {
        margin-left: 36px;
    }
`;

interface ITypeProps {
    selected: boolean;
}

const Type = styled.div<ITypeProps>`
    border-radius: 8px;
    padding: 0.3rem 1rem;
    width: 50%;
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 1rem;
    place-items: center;
    background-color: ${({selected}) =>
        selected ? `${themingVar['@leav-view-panel-label-background-active']} ` : themingVar['@leav-secondary-bg']};
    margin-top: 1rem;
`;

const Title = styled.div`
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Description = styled.div`
    opacity: 0.8;
    font-weight: 600;
`;

const CustomButton = styled(Button)`
    background-color: ${themingVar['@default-bg']};
    transform: scale(0.7);
    &:hover {
        background-color: ${themingVar['@default-bg']};
    }
`;

interface IViewProps {
    view: IView;
}

function View({view}: IViewProps): JSX.Element {
    const {t} = useTranslation();
    const {stateItems, dispatchItems} = useStateItem();

    const changeView = (view: IView) => {
        dispatchItems({
            type: LibraryItemListReducerActionTypes.SET_VIEW,
            view: {current: view}
        });
    };

    const selected = view.value === stateItems.view.current?.value;

    return (
        <Wrapper key={view.value} selected={selected} onClick={() => changeView(view)} color={view.color}>
            <div>
                <Title>
                    {view.text}

                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item>{t('view.delete')}</Menu.Item>
                            </Menu>
                        }
                    >
                        <CustomButton onClick={e => e.stopPropagation()} icon={<EllipsisOutlined />} />
                    </Dropdown>
                </Title>
                <Description>Description</Description>
                <Type selected={selected}>
                    {view.type === ViewType.list ? (
                        <>
                            <IconViewList /> {t('view.type-list')}
                        </>
                    ) : (
                        <>
                            <AppstoreFilled /> {t('view.type-tile')}
                        </>
                    )}
                </Type>
            </div>
        </Wrapper>
    );
}

export default View;
