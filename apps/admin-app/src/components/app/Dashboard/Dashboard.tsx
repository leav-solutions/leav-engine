// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import Stats from './Stats';

const iconSize = '100px';

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
                <img
                    src={`/${process.env.REACT_APP_ENDPOINT}/assets/logo-leavengine.png`}
                    alt="LEAV Engine"
                    height={iconSize}
                    className="icon"
                />
            </TitleWrapper>
            <Stats />
        </Wrapper>
    );
}

export default Dashboard;
