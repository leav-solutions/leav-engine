// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FrownFilled} from '@ant-design/icons';
import {ICommonFieldsSettings, localizedTranslation} from '@leav/utils';
import {theme} from 'antd';
import styled from 'styled-components';
import {AntdThemeToken, themeVars} from '_ui/antdTheme';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IFormElementProps} from '../../_types';
import {useLang} from '_ui/hooks';

const Wrapper = styled.div<{$themeToken: AntdThemeToken}>`
    position: relative;
    border: 1px solid ${themeVars.errorColor};
    margin-bottom: 1.5em;
    border-radius: ${p => p.$themeToken.borderRadius}px;

    label {
        font-size: 0.9em;
        background: transparent;
        text-shadow: 0px 0px 4px #fff;
        background: transparent;
        padding: 0 0.5em;
        color: ${themeVars.errorColor};
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        width: 100%;
    }
`;

const ErrorContent = styled.div`
    display: grid;
    grid-template-areas:
        'icon title'
        'icon message';
    grid-template-columns: 4rem 1fr;
`;

const IconWrapper = styled.div`
    grid-area: icon;
    font-size: 1.5rem;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${themeVars.errorColor};
`;

const Title = styled.div`
    grid-area: title;
    align-content: flex-end;
    font-size: 0.95rem;
    align-self: end;
`;

const Message = styled.div`
    grid-area: message;
    color: ${themeVars.secondaryTextColor};
    font-size: 0.8rem;
    align-self: start;
`;

function ErrorField({element}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useSharedTranslation();
    const {token} = theme.useToken();
    const {lang: availbaleLangs} = useLang();

    const label = localizedTranslation(element.settings.label, availbaleLangs);

    return (
        <Wrapper $themeToken={token}>
            <label>{label}</label>
            <ErrorContent>
                <IconWrapper>
                    <FrownFilled color="yellow" size={48} />
                </IconWrapper>
                <Title>{t('error.error_occurred')}</Title>
                <Message>{element.valueError}</Message>
            </ErrorContent>
        </Wrapper>
    );
}

export default ErrorField;
