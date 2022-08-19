// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useMenuItems from 'hooks/useMenuItems';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';
import {Header, Icon, SemanticICONS} from 'semantic-ui-react';
import styled from 'styled-components';

const TitleWrapper = styled.div`
    text-align: center;
`;

const ItemsWrapper = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: row;
`;

const Item = styled(NavLink)`
    width: 10em;
    height: 10em;
    border: 1px solid #cccccc;
    margin: 1em;
    border-radius: 5px;
    flex-wrap: wrap;
    margin-top: 3em;
    padding: 1em;
    display: flex;
    justify-content: center;
    color: #000;
`;

const ItemIcon = styled.div`
    font-size: 4em;
`;

const ItemTitle = styled.div`
    text-align: center;
    margin-top: 1em;
`;

function Dashboard(): JSX.Element {
    const {t} = useTranslation();
    const menuItems = useMenuItems();

    return (
        <>
            <TitleWrapper>
                <Header as="h1">{t('dashboard.title')}</Header>
            </TitleWrapper>
            <ItemsWrapper>
                {menuItems.map(item => (
                    <Item to={'/' + item.id} key={item.id}>
                        <ItemIcon>
                            <Icon name={item.icon as SemanticICONS} {...item.iconProps} />
                        </ItemIcon>
                        <ItemTitle>{item.label}</ItemTitle>
                    </Item>
                ))}
            </ItemsWrapper>
        </>
    );
}

export default Dashboard;
