// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import {IFormElementProps} from '../../../_types';

interface ITextBlockSettings {
    content?: string;
}

const ContentWrapper = styled.div`
    display: block;
`;

function TextBlock({settings: {content = ''}}: IFormElementProps<ITextBlockSettings>): JSX.Element {
    const {t} = useTranslation();
    return (
        <ContentWrapper data-testid="text-block-content">
            <ReactMarkdown>{content.trim() || t('forms.text_block_helper')}</ReactMarkdown>
        </ContentWrapper>
    );
}

export default TextBlock;
