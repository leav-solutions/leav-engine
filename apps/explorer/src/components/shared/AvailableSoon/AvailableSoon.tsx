// Copyright LEAV Solutions 2017
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
    return <Wrapper>🔥 {t('global.available_soon').toLocaleUpperCase()}</Wrapper>;
}

export default AvailableSoon;
