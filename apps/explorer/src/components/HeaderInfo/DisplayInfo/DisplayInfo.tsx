// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CloseOutlined} from '@ant-design/icons';
import {Badge, message as antMessage} from 'antd';
import React, {useEffect} from 'react';
import {useAppSelector} from 'redux/store';
import styled from 'styled-components';
import {IInfo, InfoType} from '../../../_types/types';

const Wrapper = styled.div`
    padding: 0.3rem 1rem;
    min-width: 25%;
    width: auto;
    text-overflow: hidden;
    font-weight: 600;
    line-height: 1em;

    background: #0d1e26 0% 0% no-repeat padding-box;
    border: 1px solid #70707031;
    border-radius: 3px;

    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;

    height: 3.5ch;
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
    const {stack} = useAppSelector(state => {
        console.debug('state', state);
        return {stack: state.info.stack};
    });

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

const ErrorMessage = styled.span`
    color: #e02020;
    font-weight: 800;
`;

const WarningMessage = styled.span`
    color: orange;
    font-weight: 600;
`;

const SuccessMessage = styled.span`
    color: greenyellow;
    font-weight: 600;
`;

const Message = ({info}: {info: IInfo}) => {
    switch (info.type) {
        case InfoType.error:
            return <ErrorMessage>{info.content}</ErrorMessage>;
        case InfoType.warning:
            return <WarningMessage>{info.content}</WarningMessage>;
        case InfoType.success:
            return <SuccessMessage>{info.content}</SuccessMessage>;
        case InfoType.basic:
        default:
            return <span>{info.content}</span>;
    }
};

export default DisplayInfo;
