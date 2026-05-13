import AppIcon from '../../shared/AppIcon';
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
