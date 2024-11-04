// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import styled from 'styled-components';

const PreviewSkeleton = styled.div`
    border-radius: 50%;
    background: #ddd;
    margin-right: 1em;
    height: 2em;
    width: 2em;
    flex-grow: 0;
`;

const TextSkeleton = styled.div`
    background: #ddd;
    height: 1.5em;
    flex-grow: 1;
`;

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 200px;
`;

function RecordCardSkeleton(): JSX.Element {
    return (
        <Wrapper>
            <PreviewSkeleton />
            <TextSkeleton />
        </Wrapper>
    );
}

export default RecordCardSkeleton;
