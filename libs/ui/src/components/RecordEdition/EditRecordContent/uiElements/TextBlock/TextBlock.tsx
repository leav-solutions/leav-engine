// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IFormTextBlockSettings} from '@leav/utils';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import {IFormElementProps} from '../../_types';

function TextBlock({element}: IFormElementProps<IFormTextBlockSettings>): JSX.Element {
    return <ReactMarkdown>{element.settings.content}</ReactMarkdown>;
}

export default TextBlock;
