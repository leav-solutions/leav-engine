// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {DownOutlined} from '@ant-design/icons';
import {Button, Input, List} from 'antd';
import React, {useEffect} from 'react';
import {animated, useSpring} from 'react-spring';
import styled from 'styled-components';
import ThemeVars from '../../themingVar';

export const BasicWrapperAttribute = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`;

export const LinkedWrapperAttribute = styled(BasicWrapperAttribute)`
    position: relative;

    &::before {
        content: '';
        position: absolute;
        left: -3.5rem;
        top: 0.75rem;
        width: 2rem;
        height: 1px;
        background: hsla(0, 0%, 0%, 0.1);
    }

    @keyframes anim-glow {
        0% {
            box-shadow: 0 0 0px 0 ${ThemeVars['@primary-color']};
        }
        50% {
            box-shadow: 0 0 5px 0 ${ThemeVars['@primary-color']};
        }
        100% {
            box-shadow: 0 0 0px 0 ${ThemeVars['@primary-color']};
        }
    }

    &::after {
        content: '';
        position: absolute;
        left: -1.5rem;
        top: 0.5rem;
        padding: 4px;
        border-radius: 100%;
        background: ${ThemeVars['@primary-color']};
        animation: anim-glow 5s ease infinite;
    }
`;

interface IWrapperAttributeProps {
    children: React.ReactNode;
    isChild: boolean;
}

export const WrapperAttribute = ({children, isChild}: IWrapperAttributeProps) => {
    if (isChild) {
        return <LinkedWrapperAttribute>{children}</LinkedWrapperAttribute>;
    }
    return <BasicWrapperAttribute>{children}</BasicWrapperAttribute>;
};

export const TextAttribute = styled.span`
    color: hsl(0, 0%, 13%);
    font-weight: 700;
`;

export const SmallText = styled.span`
    color: hsl(0, 0%, 45%);
    font-weight: 400;
    padding-left: 3px;
`;

export const ListItem = styled(List.Item)`
    &&&& {
        padding: 0.7rem 1rem;
        width: 100%;

        &:hover {
            background: hsla(205.7, 72.6%, 47.3%, 10%);
            border-radius: 0.25rem;
        }
    }
`;

export const CustomForm = styled.form`
    width: 100%;
`;

export const CustomInput = styled(Input.Search)`
    &&& {
        input {
            background: hsl(0, 0%, 95%);
            border: none;
        }
    }
`;

export const RowAttribute = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 0.2rem;

    *:first-child > *:last-child {
        margin: 0 0.2rem;
    }
`;

interface IDeployButtonProps {
    active: boolean | undefined;
    called: boolean;
    loading: boolean;
    changeCurrentAccordion: () => void;
}

export const DeployButton = ({active, changeCurrentAccordion}: IDeployButtonProps) => {
    const [animProps, set] = useSpring(() => ({transform: 'rotateX(0deg)'}));

    const onClick = () => {
        changeCurrentAccordion();
    };

    useEffect(() => {
        set({transform: `rotateX(${active ? 180 : 0}deg)`});
    }, [set, active]);

    return (
        <animated.div style={animProps}>
            <Button icon={<DownOutlined />} type="text" onClick={onClick} size="small" />
        </animated.div>
    );
};

interface IDeployContentProps {
    children: React.ReactNode;
    active: boolean;
}

export const DeployContent = ({children, active}: IDeployContentProps) => {
    return <div style={{display: active ? 'block' : 'none'}}>{children}</div>;
};

export const StyledDeployContent = styled.div`
    position: relative;
    margin-left: 5rem;

    &::before {
        content: '';
        position: absolute;
        left: -3.5rem;
        top: 0;
        width: 1px;
        height: calc(100% - 26px);
        background: hsla(0, 0%, 0%, 0.1);
    }
`;
