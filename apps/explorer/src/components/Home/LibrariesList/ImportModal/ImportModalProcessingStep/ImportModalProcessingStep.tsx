// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const CenteredWrapper = styled.div`
    text-align: center;
`;

function ImportModalProcessingStep(): JSX.Element {
    const {t} = useTranslation();

    return <CenteredWrapper data-test-id="processing">{t('global.processing') + '...'}</CenteredWrapper>;
}

export default ImportModalProcessingStep;
