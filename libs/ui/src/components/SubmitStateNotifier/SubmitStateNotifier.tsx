// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {CheckOutlined, CloseCircleOutlined, LoadingOutlined} from '@ant-design/icons';
import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {SubmitStateNotifierStates} from './_types';

interface ISubmitStateNotifierProps {
    state: SubmitStateNotifierStates;
    style?: React.CSSProperties;
}

const delay = 3000;
const animationDuration = 350;

const SuccessIcon = styled(CheckOutlined)`
    animation: appear 500ms, ${animationDuration}ms disappear ${delay - animationDuration}ms;
    color: ${props => props.theme?.antd?.colorSuccess ?? 'inherit'};

    @keyframes disappear {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(5);
        }
    }

    @keyframes appear {
        from {
            opacity: 0;
            transform: scale(5);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;

const ErrorIcon = styled(CloseCircleOutlined)`
    color: ${props => props.theme?.antd?.colorError ?? 'inherit'};
`;

function SubmitStateNotifier({state, style}: ISubmitStateNotifierProps): JSX.Element {
    let icon = null;
    const [currentState, setCurrentState] = useState<ISubmitStateNotifierProps['state']>('idle');

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        setCurrentState(state);

        // If state is succcess, set it to idle after 2 seconds
        if (state === 'success') {
            timeoutId = setTimeout(() => {
                setCurrentState('idle');
            }, delay);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [state]);

    switch (currentState) {
        case 'processing':
            icon = <LoadingOutlined />;
            break;
        case 'success':
            icon = <SuccessIcon />;
            break;
        case 'error':
            icon = <ErrorIcon />;
            break;
    }

    return <span style={style}>{icon}</span>;
}

export default SubmitStateNotifier;
