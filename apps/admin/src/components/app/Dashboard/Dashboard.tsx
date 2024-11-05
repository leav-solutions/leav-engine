// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import AppIcon from 'components/shared/AppIcon';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import Stats from './Stats';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5rem;
`;

const TitleWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

function Dashboard(): JSX.Element {
    const {t} = useTranslation();

    return (
        <Wrapper>
            <TitleWrapper>
                <h3 className="title">{t('dashboard.title')}</h3>
                <AppIcon size="small" />
            </TitleWrapper>
            <Stats />
        </Wrapper>
    );
}

export default Dashboard;
