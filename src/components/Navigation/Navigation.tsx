import React from 'react';
import styled from 'styled-components';

const Page = styled.div`
    width: 100vw;
    height: calc(100vh - 3rem);
    display: grid;
    margin-left: 10rem;
    grid-template-columns: repeat(4, 1fr);
`;

const Column = styled.div`
    box-shadow: 10px 0 10px -2px #888;
`;

function Navigation(): JSX.Element {
    return (
        <Page>
            <Column></Column>
        </Page>
    );
}

export default Navigation;
