// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FrownFilled} from '@ant-design/icons';
import {ICommonFieldsSettings} from '@leav/utils';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {IFormElementProps} from '../../_types';

const Wrapper = styled.div`
    position: relative;
    border: 1px solid ${themingVar['@error-color']};
    margin-bottom: 1.5em;
    border-radius: ${themingVar['@border-radius-base']};

    label {
        font-size: 0.9em;
        background: transparent;
        text-shadow: 0px 0px 4px #fff;
        background: transparent;
        padding: 0 0.5em;
        color: ${themingVar['@error-color']};
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
    color: ${themingVar['@error-color']};
`;

const Title = styled.div`
    grid-area: title;
    align-content: flex-end;
    font-size: 0.95rem;
    align-self: end;
`;

const Message = styled.div`
    grid-area: message;
    color: ${themingVar['@leav-secondary-font-color']};
    font-size: 0.8rem;
    align-self: start;
`;

function ErrorField({element}: IFormElementProps<ICommonFieldsSettings>): JSX.Element {
    const {t} = useTranslation();

    return (
        <Wrapper>
            <label>{element.settings.label}</label>
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
