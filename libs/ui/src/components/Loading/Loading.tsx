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
