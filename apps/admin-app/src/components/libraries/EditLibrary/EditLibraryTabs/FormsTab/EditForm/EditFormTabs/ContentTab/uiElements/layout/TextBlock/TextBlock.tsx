// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {IFormElementProps} from '../../../_types';

interface ITextBlockSettings {
    content?: string;
}

function TextBlock({settings: {content = ''}}: IFormElementProps<ITextBlockSettings>): JSX.Element {
    const {t} = useTranslation();
    return <div>{content || t('forms.text_block_helper')}</div>;
}

export default TextBlock;
