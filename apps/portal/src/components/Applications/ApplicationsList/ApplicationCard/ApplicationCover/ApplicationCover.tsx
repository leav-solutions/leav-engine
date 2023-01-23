// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AntdThemeToken, ApplicationInstallTag, useLang} from '@leav/ui';
import {getInvertColor, localizedTranslation, stringToColor} from '@leav/utils';
import {theme} from 'antd';
import {SyntheticEvent} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {GET_APPLICATIONS_applications_list} from '_gqlTypes/GET_APPLICATIONS';

interface IApplicationCoverProps {
    application: GET_APPLICATIONS_applications_list;
    onInstallTagClick: (e: SyntheticEvent<any>) => void;
}

const Wrapper = styled.div`
    position: relative;
`;

const Cover = styled.div<{hasIcon: boolean; $themeToken: AntdThemeToken}>`
    font-size: 3.5em;
    font-weight!: bold;
    letter-spacing: 0.5em;
    text-align: center;
    text-transform: uppercase;
    text-indent: ${props => (props.hasIcon ? '0' : '0.5em')};
    overflow: hidden;
    height: 6rem;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-top-left-radius: ${props => props.$themeToken.borderRadius}px;
    border-top-right-radius: ${props => props.$themeToken.borderRadius}px;
`;

const AppImage = styled.img`
    height: 5rem;
    object-fit: cover;
`;

function ApplicationCover({application, onInstallTagClick}: IApplicationCoverProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();
    const {token} = theme.useToken();

    const label = localizedTranslation(application.label, lang);
    const initials = label
        .split(' ')
        .splice(0, 2)
        .map(word => word[0])
        .join('');

    const appIcon = application.icon?.whoAmI?.preview?.medium;
    const bgColor = application.color ?? stringToColor(label);
    const fontColor = getInvertColor(bgColor);

    return (
        <Wrapper>
            <Cover style={{background: bgColor, color: fontColor}} hasIcon={!!appIcon} $themeToken={token}>
                {appIcon ? <AppImage src={appIcon} height="3rem" /> : initials}
            </Cover>
            <ApplicationInstallTag
                application={application}
                style={{position: 'absolute', bottom: '1em', left: '1em'}}
                onClick={onInstallTagClick}
            />
        </Wrapper>
    );
}

export default ApplicationCover;
