// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Spin} from 'antd';
import styled from 'styled-components';

interface ILoadingProps {
    compact?: boolean;
}

const LoadingElem = styled(Spin)<ILoadingProps>`
    && {
        display: block;
        margin: ${props => (props.compact ? '1em' : '3em')};
        font-size: inherit;
    }
`;

function Loading(props: ILoadingProps): JSX.Element {
    return <LoadingElem {...props} />;
}

export default Loading;
