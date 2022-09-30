// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import useMenuItems from 'hooks/useMenuItems';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';
import {Header, Icon, SemanticICONS} from 'semantic-ui-react';
import styled from 'styled-components';
import {activeItemColor} from 'themingVar';

const TitleWrapper = styled.div`
    text-align: center;
`;

const ItemsWrapper = styled.div`
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-direction: row;
    flex-wrap: wrap;
`;

const Item = styled(NavLink)`
    margin: 1em;
    flex-wrap: wrap;
    margin-top: 3em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: #000;

    :hover {
        color: inherit;
    }
`;

const ItemIcon = styled.div`
    width: 8rem;
    height: 8rem;
    border: 1px solid #cccccc;
    border-radius: 5px;
    padding: 1rem;
    font-size: 3em;

    ${Item}:hover & {
        & {
            border: 1px solid ${activeItemColor};
        }
    }
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
                            {typeof item.icon === 'string' ? (
                                <Icon name={item.icon as SemanticICONS} size="big" {...item.iconProps} />
                            ) : (
                                React.cloneElement(item.icon as JSX.Element, {
                                    ...item.iconProps,
                                    style: {padding: '1rem'},
                                    size: '4.2rem'
                                })
                            )}
                        </ItemIcon>
                        <ItemTitle>{item.label}</ItemTitle>
                    </Item>
                ))}
            </ItemsWrapper>
        </>
    );
}

export default Dashboard;
