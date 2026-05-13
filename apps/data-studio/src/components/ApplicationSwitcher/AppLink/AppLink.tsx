import {type CSSProperties, type ReactNode} from 'react';
import styled from 'styled-components';
import {type GET_APPLICATIONS_applications_list} from '../../../_gqlTypes/GET_APPLICATIONS';

interface IAppLinkProps {
    app: GET_APPLICATIONS_applications_list;
    label: string;
    children: ReactNode;
    style?: CSSProperties;
}

const Wrapper = styled.a`
    display: flex;
    flex-direction: column;
    justify-items: center;
    height: 100%;
    justify-content: center;
    line-height: 1.3em;
`;

function AppLink({app, label, children, style}: IAppLinkProps): JSX.Element {
    return (
        <Wrapper href={app.url} aria-label={label} style={style}>
            {children}
        </Wrapper>
    );
}

export default AppLink;
