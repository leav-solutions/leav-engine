// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const Wrapper = styled.span`
    font-size: 0.6em;
    color: #444;
    font-weight: bold;
    background: #dedede;
    border-radius: 4px;
    padding: 2px 5px;
    margin-left: 1em;
`;

function AvailableSoon(): JSX.Element {
    const {t} = useTranslation();
    return (
        <Wrapper>
            <span role="img" aria-label="available_soon">
                🔥
            </span>{' '}
            {t('global.available_soon').toLocaleUpperCase()}
        </Wrapper>
    );
}

export default AvailableSoon;
