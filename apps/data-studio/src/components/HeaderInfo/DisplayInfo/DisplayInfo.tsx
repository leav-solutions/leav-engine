// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckCircleOutlined, CloseCircleOutlined, CloseOutlined, WarningOutlined} from '@ant-design/icons';
import {AntdThemeToken} from '@leav/ui';
import {Badge, message as antMessage, Space, theme} from 'antd';
import React, {useEffect} from 'react';
import {useAppSelector} from 'reduxStore/store';
import styled from 'styled-components';
import {IInfo, InfoType} from '../../../_types/types';

interface IMessageProps {
    $themeToken: AntdThemeToken;
}

const Wrapper = styled.div`
    padding: 0.3rem 1rem;
    min-width: 25%;
    width: auto;
    text-overflow: hidden;
    font-weight: 600;
    line-height: 1em;
    color: #000;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;

    white-space: nowrap;
    text-overflow: ellipsis;
`;

const CustomBadge = styled(Badge)`
    margin: 0 0.3rem;
    & > * {
        border: none;
        box-shadow: none;
    }
`;

const ErrorMessage = styled(Space)<IMessageProps>`
    color: ${props => props.$themeToken.colorError};
    font-weight: 800;
`;

const WarningMessage = styled(Space)<IMessageProps>`
    color: ${props => props.$themeToken.colorWarning};
    font-weight: 600;
`;

const SuccessMessage = styled(Space)<IMessageProps>`
    color: ${props => props.$themeToken.colorSuccess};
    font-weight: 600;
`;

interface IDisplayInfoProps {
    message: IInfo;
    activeTimeouts: {info: any; base: any};
    cancelInfo: () => void;
    triggerInfos: IInfo[];
    setTriggerInfos: React.Dispatch<React.SetStateAction<IInfo[]>>;
}

function DisplayInfo({
    message,
    activeTimeouts,
    cancelInfo,
    triggerInfos,
    setTriggerInfos
}: IDisplayInfoProps): JSX.Element {
    const {stack} = useAppSelector(state => ({stack: state.info.stack}));

    useEffect(() => {
        if (triggerInfos.length) {
            const [info, ...restInfos] = triggerInfos;

            switch (info.type) {
                case InfoType.error:
                    antMessage.error(info.content);
                    break;
                case InfoType.success:
                    antMessage.success(info.content);
                    break;
                case InfoType.warning:
                    antMessage.warning(info.content);
                    break;
                case InfoType.basic:
                default:
                    antMessage.info(info.content);
                    break;
            }

            setTriggerInfos(restInfos);
        }
    }, [triggerInfos, setTriggerInfos]);

    return (
        <>
            <Wrapper data-testid="info-message-wrapper">
                <Message info={message} />
                <span>
                    {activeTimeouts.info && (
                        <div>
                            <CustomBadge count={stack.length} />
                            <CloseOutlined onClick={cancelInfo} />
                        </div>
                    )}
                </span>
            </Wrapper>
        </>
    );
}

const Message = ({info}: {info: IInfo}) => {
    const {token: themeToken} = theme.useToken();
    switch (info.type) {
        case InfoType.error:
            return (
                <ErrorMessage $themeToken={themeToken}>
                    <CloseCircleOutlined />
                    {info.content}
                </ErrorMessage>
            );
        case InfoType.warning:
            return (
                <WarningMessage $themeToken={themeToken}>
                    <WarningOutlined />
                    {info.content}
                </WarningMessage>
            );
        case InfoType.success:
            return (
                <SuccessMessage $themeToken={themeToken}>
                    <CheckCircleOutlined />
                    {info.content}
                </SuccessMessage>
            );
        case InfoType.basic:
        default:
            return <span>{info.content}</span>;
    }
};

export default DisplayInfo;
