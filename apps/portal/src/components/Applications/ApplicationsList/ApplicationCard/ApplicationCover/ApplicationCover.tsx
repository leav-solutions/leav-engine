// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getInvertColor, localizedTranslation, stringToColor} from '@leav/utils';
import useLang from 'hooks/useLang';
import React from 'react';
import styled from 'styled-components';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';

interface IApplicationCoverProps {
    application: GET_APPLICATIONS_applications_list;
}

const Cover = styled.div`
    font-size: 3.5em;
    font-weight!: bold;
    letter-spacing: 0.5em;
    text-align: center;
    text-transform: uppercase;
    text-indent: 0.5em;
`;

function ApplicationCover({application}: IApplicationCoverProps): JSX.Element {
    const {lang} = useLang();
    const label = localizedTranslation(application.label, lang);
    const initials = label
        .split(' ')
        .splice(0, 2)
        .map(word => word[0])
        .join('');

    const bgColor = application.color ?? stringToColor(label);
    const fontColor = getInvertColor(bgColor);
    return <Cover style={{background: bgColor, color: fontColor}}>{initials}</Cover>;
}

export default ApplicationCover;
